"use strict";

let initMenu = function(elem, name) {
    const menuView = new MenuView();
    const menuController = new MenuController(elem, menuView, name);

    return menuController;
}

const mediator = new Mediator();
let init = function() {
    const menu = initMenu(document.getElementById("menu"), "menu");
    mediator.register(menu);
    mediator.send("onload", "menu");
}

init();
