"use strict";

function GalleryModel(settings) {
    EventEmiter.apply(this, arguments);
    this._count = settings.count;
}
GalleryModel.prototype = Object.create(EventEmiter.prototype);
GalleryModel.prototype.constructor = GalleryModel;


function GalleryView(model, gallery) {
    EventEmiter.apply(this, arguments);
    this._model = model;
    this._gallery = gallery;
    this._images = null;
    this._paginator = document.querySelector("#paginator");
    this._current = 1;
    this._detail = null;
    this._last = null;
}
GalleryView.prototype = Object.create(EventEmiter.prototype);
GalleryView.prototype.constructor = GalleryView;
GalleryView.prototype.renderPaginator = function() {
    let paginator = this._gallery;
    paginator.querySelector("#current").style.display = "none";
    last.innerHTML = this._last;
    if (this._current === this._last) {
        let last = paginator.querySelector("#last");
        last.style.display = "none";
    }
}
GalleryView.prototype.hideGallery = function() {
    this._gallery.style.display = "none";
}
GalleryView.prototype.showGallery = function() {
    this._gallery.style.display = "block";
}
GalleryView.prototype.changePaginatorState = function() {
    let first = this._gallery.querySelector("#first");
    let current = this._gallery.querySelector("#current");
    let last = this._gallery.querySelector("#last");
    if (this._current === 1) {
        if (!first.classList.contains("active")) {
            first.classList.toggle("active");
        }
        current.classList.remove("active");
        last.classList.remove("active");
        current.style.display = "none";     
    }
    else if (this._current === +last.innerHTML) {
        if (!last.classList.contains("active")) {
            last.classList.toggle("active");
        }
        current.classList.remove("active");
        first.classList.remove("active");
        current.style.display = "none";
    }
    else {
        first.classList.remove("active");
        last.classList.remove("active");
        current.style.display = "block";
        current.innerHTML = this._current;
        if (!current.classList.contains("active")) {
            current.classList.toggle("active");
        }
    }
}


function GalleryController(view, model, name){
    EventEmiter.apply(this, arguments);
    this._name = name;
    this._model = model;
    this._view = view;
    this.on("showNextDetail", function() { this.showNextDetail(event) }.bind(this));
    this.on("showPrevDetail", function() { this.showPrevDetail(event) }.bind(this));
    this.on("showGallery", function() { this.showGallery() }.bind(this));
    this.on("hideGallery", function() { this._view.hideGallery() }.bind(this));
    this._view.on("galleryListener", function() { this.galleryListener(event) }.bind(this));
    this._view.on("paginatorListener", function() { this.paginatorListener(event) }.bind(this));
}
GalleryController.prototype = Object.create(EventEmiter.prototype);
GalleryController.prototype.constructor = GalleryController;
GalleryController.prototype.loadImages = function(start) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', "./index.php?page=gallery&start=" + start + "&count=" + this._model._count, true);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
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
            let imgs = JSON.parse(xhr.responseText);
            let box = this._view._paginator;
            box.innerHTML = "";
            for (let i = 0; i < imgs.length; i++) {
                let div = document.createElement("div");
                div.classList.add("item");
                div.innerHTML = "<div class='image' data-id=" + imgs[i]["id"] + "><img src=" + imgs[i]["img"] + "></img>" + 
                "<i item=0 class='far fa-comment comment'> " + imgs[i]["comments"] + "</i>" +
                "<i class='far fa-heart icon'> " + imgs[i]["likes"] + "</i></div>";
                box.appendChild(div);
                let like = div.querySelector(".icon");
                if (imgs[i]["like"]) {
                    like.classList.add("like");
                }
            }
        }
    }.bind(this)
}
GalleryController.prototype.galleryListener = function(event) {
    let target = event.target;
    if (target.tagName === "I") {
        if (target.classList.contains("comment")) {
            this.send("showDetail", "imageList", target.parentNode);
        }
        else if (target.classList.contains("icon")) {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', "./index.php?page=gallery&addLike=" + target.parentNode.dataset.id);
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
                    if (xhr.responseText === "add") {
                        target.classList.add("like");
                        target.innerHTML = +target.innerHTML + 1;
                    };
                }
            }.bind(this)   
        }
    }
}
GalleryController.prototype.showGallery = function() {
    this._view._paginator.onmousedown = function(event) {
        this.galleryListener(event);
    }.bind(this);
    this._view._gallery.onmousedown = function(event) {
        this.paginatorListener(event);
    }.bind(this);
    let xhr = new XMLHttpRequest();
    xhr.open('GET', "./index.php?page=gallery&all=true");
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
            let total = xhr.responseText;
            this._view._last = Math.ceil(total / this._model._count);
            this.loadImages(0);
            this._view.renderPaginator();
        }
    }.bind(this)
}
GalleryController.prototype.paginatorListener = function(event) {
    let target = event.target;
    let id = target.id;
    let cur = this._view._current;
    let last = this._view._last;
    if (id === "next" && cur !== last) {
        this.loadImages(cur * this._model._count);
        this._view._current++;
    }
    else if (id === "prev" && cur !== 1) {
        this._view._current--;
        this.loadImages((cur - 2) * this._model._count);
    }
    else if (id === "first" && cur !== 1) {
        this._view._current = 1;
        this.loadImages(0);
    }
    else if (id === "last" && cur !== last) {
        this._view._current = last;
        this.loadImages((last - 1) * this._model._count);
    }
    this._view.changePaginatorState();
}
