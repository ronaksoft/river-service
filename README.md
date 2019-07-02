 <div align="center">
 <img align="center" width="256" src="https://web.river.im/static/media/icon.0225578f.png" />
 
  <h2>River Messaging App Web Service</h2>
  <blockquote>Library for inserting River in your webpage</blockquote>
  <a href="https://travis-ci.org/ronaksoft/river-service"><img src="https://travis-ci.org/ronaksoft/river-service.svg?branch=master" /></a> <img src="https://img.shields.io/david/ronaksoft/river-service.svg" /> <a href="https://david-dm.org/ronaksoft/river-service?type=dev"><img src="https://img.shields.io/david/dev/ronaksoft/river-service.svg" /></a> <img src="https://api.dependabot.com/badges/status?host=github&repo=ronaksoft/river-service" />
 
 #### This is a package for integrating river into your webapp, check out [River](https://river.im).

</div>

## ⭐️ Features

- RTL Support
- Jest unit testing
- Daily [dependabot](https://dependabot.com) dependency updates

## 📦 Installation

```
npm install river-service
```

## 💎 Usage

```js
const opts = {
    rtl: false,
    theme: 'dark',
};
const userInfo = {
    firstname: 'FIRST_NAME',
    lastname: 'LAST_NAME',
    workspace: 'cyrus.river.im',
    phone: '23740077'
};

let riverService = window.RiverService.default;
let srv = new riverService(opts);
srv.onload = () => {
    srv.setUserInfo(userInfo).then((res) => {
        console.log(res);
    });
}
```

## Options
| Property      | Default              |  Type       |
| ------------- |:--------------------:| -----------:|
| url           |https://web.river.im  | string      |
| rtl           |false                 | boolean     |
| theme         |''                    | string     |
| el            |(appends new element) | HTMLElement |

## User info object <userInfo>
| Property      | Default          |  Type  |
| ------------- |:----------------:| ------:|
| firstname     |''                | string |
| lastname      |''                | string |
| workspace     | 'cyrus.river.im' | string |
| phone         |0                 | number |

## ✍️ Methods

+ setUserInfo(userInfo)
+ toggleVisible(boolean)
toggles visibility of badge
+ setRTL(boolean)
+ setTheme(string)
+ halt()
Removes iframe from page temprorary but still button is in access.
+ resume()
Inserts the iframe in page.
+ destroy()
Removes element from page.


## ✅ Websites built with this lib

- [Nested](https://nested.me) - Nested - Team Commiunication Platform