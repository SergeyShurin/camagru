"use strict";


function MenuView() {
    EventEmiter.apply(this, arguments);
    this._pages = {
        logout: true
    };
    this._currentPage = null;
    this._menu = null;
}
MenuView.prototype = Object.create(EventEmiter.prototype);
MenuView.prototype.constructor = MenuView;
MenuView.prototype.showLoginMenu = function() {
    let menu = this._menu;
    if (menu) {
        let links = menu.querySelector(".links");
        let reg = menu.querySelector(".sign-up-btn");
        let logout = menu.querySelector(".logout-btn");
        let login = menu.querySelector(".login-btn");
        login.style.display = "none";
        logout.style.display = "block";
        reg.style.display = "none";
        links.style.display = "flex";
    }
}
MenuView.prototype.showLogoutMenu = function() {
    let menu = this._menu;
    if (menu) {
        let links = menu.querySelector(".links");
        let reg = menu.querySelector(".sign-up-btn");
        let logout = menu.querySelector(".logout-btn");
        let login = menu.querySelector(".login-btn");
        login.style.display = "block";
        logout.style.display = "none";
        reg.style.display = "block";
        links.style.display = "none";
    }
}
MenuView.prototype.changeCurrentPage = function(page) {
    if (this._currentPage && this._currentPage !== page) {
        let btn = this._menu.querySelector("." + this._currentPage);
        btn.classList.remove("active");
    }
    if (page === "main") {
        let btn = this._menu.querySelector(".main");
        this.emit("openMainPage");
        btn.classList.add("active");
    }
    else if (page === "gallery") {
        let btn = this._menu.querySelector(".gallery");
        this.emit("openGalleryPage");
        btn.classList.add("active");
    }
    else if (page === "profile") {
        let btn = this._menu.querySelector(".profile");
        this.emit("openProfilePage");
        btn.classList.add("active");
    }
    else {
        throw new Error("page " + page + " no exist");
    }
    this._currentPage = page;
}

function MenuController(menu, view, name) {
    EventEmiter.apply(this, arguments);
    this._name = name;
    this._view = view;
    this._view._menu = menu;
    this._view._menu.onmousedown = function (event) { this.menuListener(event) }.bind(this);
    this._view.on("openProfilePage", function() { this.send("openProfilePage", "profilePage") }.bind(this));
    this._view.on("openMainPage", function() { this.send("openMainPage", "mainPage") }.bind(this));
    this._view.on("openGalleryPage", function() { this.send("openGalleryPage", "galleryPage") }.bind(this));
    this.on("submit",  function() {
        this._view.showLoginMenu();
        this._makePageClick(".main");
    }.bind(this));
    this.on("onload", function() { this._makePageClick(".gallery") }.bind(this));
    this._makePageClick = function(selector) {
        let btn = this._view._menu.querySelector(selector);
        var event = new Event("click");
        btn.dispatchEvent(event);
        this.menuListener(event);
    }
    this._togglePage = function(pageName) {
        if (pageName === "logForm") {
            this.send("showForm", "logForm");
            this.send("fadeForm", "regForm");
        }
        else if (pageName === "regForm") {
            this.send("showForm", "regForm");
            this.send("fadeForm", "logForm");
        }
        else if (pageName === "logout") {
            this._view.showLogoutMenu();
            this._makePageClick(".gallery");
        }
        else {
            let main = document.getElementsByTagName("main")[0];
            main.innerHTML = this._view._pages[pageName]["html"];
            this._view._pages[pageName]["script"]();
            this._view.changeCurrentPage(pageName);
        }
    }
    this.menuListener = function(event) {
        let target = event.target;
        if (target.tagName === "BUTTON" || target.tagName === "A") {
            let src = target.dataset.src;
            if (src === "logForm" || src === "regForm") {
                if (!this._view._pages["form"]) {
                    this.loadPage("./js/baseForm.js", function() {
                        this._view._pages["form"] = true;
                        this._togglePage(src);
                    }.bind(this));
                }
                else {
                    this._togglePage(src);
                }
            }
            else if (src === "main") {
                if (!this._view._pages["main"]) {
                    this.loadMainPage();            
                }
                else {
                    this._togglePage(src);
                }
            }
            else if (src === "gallery") {
                if (!this._view._pages["gallery"]) {
                    this.loadGalleryPage();            
                }
                else {
                    this._togglePage(src);
                }
            }
            else if (src === "profile") {
                if (!this._view._pages["profile"]) {
                    this.loadProfilePage();            
                }
                else {
                    this._togglePage(src);
                }
            }
            else if (src === "logout") {
                return location.href = './index.php';
            }
        } 
    }
    this.loadProfilePage = function() {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', "./index.php?load=profile", true);
        let csrfCookie = document.cookie.match(/token=(.*?$)/);
        if (csrfCookie) {
            xhr.setRequestHeader("X-CSRF-TOKEN", csrfCookie[1]);
        }
        xhr.send();
        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) return;
            if (xhr.status != 200) {
                alert(xhr.status + ': ' + xhr.statusText);
            } else {
                this._view._pages["profile"] = {};
                this._view._pages["profile"].html = xhr.responseText;
                let main = document.getElementsByTagName("main")[0];
                main.innerHTML = xhr.responseText; 
                this.loadPage("./js/profile.js", function() {
                    this._view._pages["profile"].script = initProfile;
                    this._togglePage("profile");
                }.bind(this));
            }
        }.bind(this);
    }
    this.loadGalleryPage = function() {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', "./index.php?load=gallery", true);
        let csrfCookie = document.cookie.match(/token=(.*?$)/);
        if (csrfCookie) {
            xhr.setRequestHeader("X-CSRF-TOKEN", csrfCookie[1]);
        }
        xhr.send();
        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) return;
            if (xhr.status != 200) {
                alert(xhr.status + ': ' + xhr.statusText);
            } else {
                this._view._pages["gallery"] = {};
                this._view._pages["gallery"].html = xhr.responseText;
                let main = document.getElementsByTagName("main")[0];
                main.innerHTML = xhr.responseText; 
                this.loadPage("./js/gallery.js", function() {
                    this.loadPage("./js/imageList.js", function() {
                        this.loadPage("./js/galleryPage.js", function() {
                            this._view._pages["gallery"].script = initGallery;
                            this._togglePage("gallery");
                        }.bind(this));
                    }.bind(this));
                }.bind(this));
            }
        }.bind(this);
    }
    this.loadMainPage = function() {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', "./index.php?load=main", true);
        let csrfCookie = document.cookie.match(/token=(.*?$)/);
        if (csrfCookie) {
            xhr.setRequestHeader("X-CSRF-TOKEN", csrfCookie[1]);
        }
        xhr.send();
        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) return;
            if (xhr.status != 200) {
                alert(xhr.status + ': ' + xhr.statusText);
            } else {
                this._view._pages["main"] = {};
                this._view._pages["main"].html = xhr.responseText;
                let main = document.getElementsByTagName("main")[0];
                main.innerHTML = xhr.responseText; 
                this.loadPage("./js/video.js", function() {
                    this.loadPage("./js/carousel.js", function() {
                        this.loadPage("./js/mainPage.js", function() {
                            this._view._pages["main"].script = initMain;
                            this._togglePage("main");
                        }.bind(this));
                    }.bind(this));
                }.bind(this));
            }
        }.bind(this);
    }
}
MenuController.prototype = Object.create(EventEmiter.prototype);
MenuController.prototype.constructor = MenuController;
