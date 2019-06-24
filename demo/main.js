let riverService = window.RiverService.default;
let srv = new riverService({});

srv.onload = () => {
    srv.setUserInfo({
        firstname: 'FIRST_NAME',
        lastname: 'LAST_NAME',
        workspace: 'cyrus.river.im',
        phone: '23740077'
    }).then((res) => {
        window.console.log(res);
    });

    srv.toggleVisible();
    srv.toggleVisible();
}

    