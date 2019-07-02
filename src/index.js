import "./index.css";

class RiverService {
  constructor(params = {}) {
    const hasInitialized = !!RiverService.instance;
    if (hasInitialized) {
      return RiverService.instance;
    }

    this.iframe = null;
    this.anchor = null;
    this.fnQueue = {};
    this.fnIndex = 0;
    this.reqId = 0;
    this.messageListeners = {};
    this.parentEl = `#river-embed`;
    this.iframeEl = `#river-iframe`;
    this.anchorEl = `#river-anchor`;
    this.riverOpen = false;
    this.onload = null;
    this.visible = false;
    this.rtl = params.rtl || false;
    this.theme = params.theme || false;
    this.url = params.url || "https://web.river.im";
    this.el = params.el || null;
    this.init();

    RiverService.instance = this;

    this.iframe = document.querySelector(`${this.iframeEl} iframe`);

    window.addEventListener("message", e => {
      if (e.data) {
        try {
          const data = JSON.parse(e.data);
          if (["river_web"].indexOf(data.client) > -1) {
            if (data.mode === "res") {
              this.response(data);
            } else if (data.mode === "req") {
              this.callHandlers(data.cmd, data);
            }
          }
        } catch (e) {
          window.console.warn(e);
        }
      }
    });

    this.iframe.onload = () => {
      this.riverLoaded();
      this.anchor = document.querySelector(this.anchorEl);
      if (this.anchor) {
        this.anchor.addEventListener("click", () => {
          this.openChat();
        });
        this.anchor.classList.remove("hide");
      }
      this.visible = true;
      if (this.onload) {
        this.onload();
      }
    };

    return this;
  }

  init() {
    let div;
    if (this.el && this.el.style) {
      div = this.el;
      div.style.cssText = "";
      div.className = "";
    } else {
      div = document.createElement("div");
    }
    if (this.rtl) {
      div.classList.add("rtl");
    }
    if (this.theme) {
      div.classList.add("theme-" + this.theme);
    }
    div.setAttribute("id", this.parentEl.replace("#", ""));
    div.innerHTML = `<div id="river-iframe">
      <div class="river-mask"></div>
      <iframe src="${this.url}">
          <p>Your browser does not support iframes.</p>
      </iframe>
  </div>
  <div id="river-anchor" class="hide">
      <div class="badge">0</div>
  </div>`;
    document.body.appendChild(div);
  }

  toggleVisible(visible) {
    if (visible === undefined) {
      this.visible = !this.visible;
    } else {
      this.visible = visible;
    }
    const el = document.querySelector(this.parentEl);
    window.console.log(this.visible);
    if (el) {
      if (!this.visible) {
        el.classList.add("hide");
      } else {
        el.classList.remove("hide");
      }
    }
  }

  setRTL(enable) {
    const el = document.querySelector(this.parentEl);
    if (el) {
      if (enable) {
        el.classList.add("rtl");
      } else {
        el.classList.remove("rtl");
      }
    }
  }

  setTheme(theme) {
    const el = document.querySelector(this.parentEl);
    if (el) {
      el.classList.add("theme-" + theme);
      el.classList.remove("theme-" + this.theme);
      this.theme = theme;
    }
  }

  riverLoaded() {
    this.isLoaded().catch(err => {
      if (err === "timeout") {
        this.riverLoaded();
      }
    });

    this.listen("unread_counter", e => {
      this.bool(e.reqId);
      this.setUnread(e.data.unread);
    });

    this.listen("close", e => {
      this.bool(e.reqId);
      this.closeChat();
    });

    this.listen("new_session", e => {
      this.bool(e.reqId);
      this.destroy();
    });
  }

  listen(subject, fn) {
    if (!subject) {
      return null;
    }
    this.fnIndex++;
    const fnIndex = this.fnIndex;
    if (!Object.prototype.hasOwnProperty.call(this.fnQueue, subject)) {
      this.fnQueue[subject] = {};
    }
    this.fnQueue[subject][fnIndex] = fn;
    return () => {
      delete this.fnQueue[subject][fnIndex];
    };
  }

  isLoaded() {
    return this.send("is_loaded", {}, 2000);
  }

  bool(reqId) {
    this.sendResponse({
      cmd: "bool",
      data: true,
      reqId
    });
  }

  setUnread(unread) {
    unread = isNaN(unread) ? 0 : unread;
    const anchorUnreadEl = document.querySelector(`${this.anchorEl} .badge`);
    if (!anchorUnreadEl) {
      return;
    }
    if (unread > 0) {
      anchorUnreadEl.classList.add("show");
    } else {
      anchorUnreadEl.classList.remove("show");
    }
    anchorUnreadEl.innerHTML = unread > 99 ? "+99" : unread;
  }

  openChat() {
    if (this.riverOpen) {
      return;
    }
    const el = document.querySelector(this.iframeEl);
    if (el) {
      el.classList.add("show");
      setTimeout(() => {
        el.classList.add("fixed");
        this.riverOpen = true;
      }, 290);
    }

    if (this.anchor) {
      this.anchor.classList.add("hide");
    }
  }

  closeChat() {
    if (!this.riverOpen) {
      return;
    }
    const el = document.querySelector(this.iframeEl);
    if (el) {
      el.classList.remove("fixed");
      setTimeout(() => {
        this.riverOpen = false;
        el.classList.remove("show");
        if (this.anchor) {
          this.anchor.classList.remove("hide");
        }
      }, 30);
    }
  }

  setUserInfo(data) {
    return this.send("user_info", data);
  }

  callHandlers(subject, payload) {
    if (!this.fnQueue[subject]) {
      return;
    }
    const keys = Object.keys(this.fnQueue[subject]);
    keys.forEach(key => {
      const fn = this.fnQueue[subject][key];
      if (fn) {
        fn(payload);
      }
    });
  }

  sendResponse(data) {
    this.iframe.contentWindow.postMessage(
      JSON.stringify({
        client: "nested_web",
        cmd: data.cmd,
        data: data.data,
        mode: "res",
        reqId: data.reqId
      }),
      "*"
    );
  }

  send(cmd, data, timeout) {
    let internalResolve = null;
    let internalReject = null;

    const reqId = ++this.reqId;

    const promise = new Promise((res, rej) => {
      internalResolve = res;
      internalReject = rej;
    });

    this.messageListeners[reqId] = {
      cmd,
      reject: internalReject,
      resolve: internalResolve
    };

    this.iframe.contentWindow.postMessage(
      JSON.stringify({
        client: "nested_web",
        cmd,
        data,
        mode: "req",
        reqId
      }),
      "*"
    );

    this.messageListeners[reqId].timeout = setTimeout(() => {
      this.dispatchTimeout(reqId);
    }, timeout || 10000);

    return promise;
  }

  response(data) {
    if (
      !Object.prototype.hasOwnProperty.call(this.messageListeners, data.reqId)
    ) {
      return false;
    }
    if (data.cmd === "error") {
      this.messageListeners[data.reqId].reject(data.data);
    } else {
      this.messageListeners[data.reqId].resolve(data.data);
    }
    if (this.messageListeners[data.reqId].timeout) {
      clearTimeout(this.messageListeners[data.reqId].timeout);
    }
    delete this.messageListeners[data.reqId];
    return true;
  }

  dispatchTimeout(reqId) {
    const item = this.messageListeners[reqId];
    if (!item) {
      return;
    }
    if (item.reject) {
      item.reject({
        err: "timeout",
        reqId
      });
    }
  }

  destroy() {}
}

export default RiverService;
