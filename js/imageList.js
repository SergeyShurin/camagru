"use strict";

function ImageListModel(settings) {
    EventEmiter.apply(this, arguments);
}
ImageListModel.prototype = Object.create(EventEmiter.prototype);
ImageListModel.prototype.constructor = ImageListModel;


function ImageListView(model) {
    EventEmiter.apply(this, arguments);
    this._model = model;
    this._detail = null;
    this._curentId = null;
    this._detailHTML = null;
}
ImageListView.prototype = Object.create(EventEmiter.prototype);
ImageListView.prototype.constructor = ImageListView;
ImageListView.prototype.addComents = function() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', "./index.php?page=detail&comments=" + this._curentId);
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
            let coments = JSON.parse(xhr.responseText);
            let box = this._detail.querySelector(".comments");
            box.innerHTML = "";
            if (coments) {
                for (let i = 0; i < coments.length; i++) {
                    this.addComentTo(box, coments[i]["text"], coments[i]["username"]);
                }
            }
        }
    }.bind(this)
}
ImageListView.prototype.addComentTo = function(box, text, user) {
    let div = document.createElement("div");
    div.classList.add("comment");
    div.textContent = user + " : " + text;
    box.appendChild(div);
}
ImageListView.prototype.renderDetail = function(id) {
    this._curentId = id;
    let img = document.createElement("img");
    img.setAttribute("src", "./images/image" + id + ".png");
    if (!this._detail) {
        let div = document.createElement("div");
        div.id = "detail";
        div.innerHTML = this._detailHTML;
        document.body.appendChild(div);
        let box = div.querySelector(".img-detail-container");
        let btn = div.querySelector("i");
        div.querySelector("input").focus();
        btn.onclick = function(event) { this.emit("sendMessage", event) }.bind(this);
        btn.dataset["id"] = id;
        box.appendChild(img);
        div.onmousedown = function() { this.emit("detailListener", event); return false }.bind(this);
        this._detail = div;
    }
    else {
        let imgBox = this._detail.querySelector(".img-detail-container");
        imgBox.innerHTML = "";
        imgBox.appendChild(img);
    }
    if (img.height > img.width) {
        img.style.height = "100%";
    }
    else {
        img.style.width = "100%";
    }
    this.addComents();
}
ImageListView.prototype.getDetail = function(elem) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', "./index.php?page=detail");
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
            this._detailHTML = xhr.responseText;
            this.renderDetail(elem.dataset.id);
        }
    }.bind(this)
}

function ImageListController(view, model, name) {
    EventEmiter.apply(this, arguments);
    this._name = name;
    this._model = model;
    this._view = view;
    this.on("showDetail", function(elem) { this._view.getDetail(elem) }.bind(this));
    this._view.on("detailListener", function() { this.detailListaener(event) }.bind(this));
    this._view.on("sendMessage", function(event) { this.sendMessage(event) }.bind(this));
}
ImageListController.prototype = Object.create(EventEmiter.prototype);
ImageListController.prototype.constructor = ImageListController;
ImageListController.prototype.sendMessage = function(event) {
    let target = event.target;
    let id = target.dataset.id;
    let text = target.parentNode.querySelector("input").value;
    target.parentNode.querySelector("input").value = "";
    if (text) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', "./index.php?page=detail&sent=" + id + "&text=" + text);
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
                if (xhr.responseText === "forbid") {
                    alert("You need to authorize before send a message")
                }
                else {
                    let comments = target.parentNode.querySelector(".comments");
                    this._view.addComentTo(comments, text, xhr.responseText);
                }
            }
        }.bind(this) 
    }
}
ImageListController.prototype.detailListaener = function(event) {
    let target = event.target;
    let id = this._view._curentId;
    if (target.classList.contains("background")) {
        document.body.removeChild(this._view._detail);
        this._view._detail = null;
    }
    else if (target.classList.contains("img-detail-container") ||
    target.parentNode.classList.contains("img-detail-container")) {
        let box = this._view._detail.querySelector(".img-detail-container");
        let coordsBox = box.getBoundingClientRect(); 
        if (event.clientX - coordsBox.left > coordsBox.width / 2) {
            this.getPrevImage(id);
        }
        else {
            this.getNextImage(id);
        }
    }
}
ImageListController.prototype.getPrevImage = function(id) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', "./index.php?page=detail&prev=" + id);
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
            let data = JSON.parse(xhr.responseText);
            if (data[0]) {
                this._view.renderDetail(data[0]["img_id"]);
            }
            else {
                this._view._detail.parentNode.removeChild(this._view._detail);
                this._view._detail = null;
            }
        }
    }.bind(this) 
}
ImageListController.prototype.getNextImage = function(id) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', "./index.php?page=detail&next=" + id);
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
            let data = JSON.parse(xhr.responseText);
            if (data[0]) {
                this._view.renderDetail(data[0]["img_id"]);
            }
            else {
                this._view._detail.parentNode.removeChild(this._view._detail);
                this._view._detail = null;
            }
        }
    }.bind(this) 
}
