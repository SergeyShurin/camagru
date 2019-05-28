"use strict";

function VideoModel(videoSettings) {
    EventEmiter.apply(this, arguments);
    this._videoSettings = videoSettings;
}
VideoModel.prototype = Object.create(EventEmiter.prototype);
VideoModel.prototype.constructor = VideoModel;


function VideoView(model, node) {
    EventEmiter.apply(this, arguments);
    this._size = null; // image size
    this._model = model;
    this._main = main;
    this._video = node.querySelector("#video");
    this._videoContainer = node.querySelector("#video-container");
    this._videoSettings = {
        coords: null, // video.getBoundingClientRect()
        w: this._model._videoSettings.width, // max video
        h: this._model._videoSettings.height, // max video
        currentScale: null, // depends on screen size
    };
    this._imageSettings = {
        w: null,
        h: null,
        precW: null,
        precH: null,
        wheelScale: 1, // depends on scroll wheell
        posX: null, // center image
        posY: null, // on 50 / 50
    };
    this._btn = node.querySelector("#superposable-btn");
    this._selected = null; // current selected image
    this._cloneImage = null;
}
VideoView.prototype = Object.create(EventEmiter.prototype);
VideoView.prototype.constructor = VideoView;
VideoView.prototype.sendImg = function(img) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', "./index.php", true);
    let csrfCookie = document.cookie.match(/token=(.*?$)/);
    if (csrfCookie) {
        xhr.setRequestHeader("X-CSRF-TOKEN", csrfCookie[1]);
    }
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    let data = "";
    data += "img2=" + this._selected.getAttribute("src");
    data += "&scope=" + this._videoSettings.currentScale * this._imageSettings.wheelScale;
    data += "&x=" + this._imageSettings.posX / 100;
    data += "&y=" + this._imageSettings.posY / 100;
    data += "&page=superposeImages";
    if (img) { data += "&img=" + encodeURIComponent(img) };
    xhr.send(data);
    xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) return;
        if (xhr.status != 200) {
            alert(xhr.status + ': ' + xhr.statusText);
        } else {
            this.emit("addImageToCarousel")
        }
    }.bind(this);
};
VideoView.prototype.changeBtnStatus = function(status, img) {
    if (status === "allow") {
        this._selected = img.img;
        this._size = img.size;
        if (!this._btn.classList.contains("active")) {
            this._btn.classList.toggle("active");
            this._btn.disabled = false;
            this._btn.innerHTML = "Press to create superposable image";
        }
    }
    else if (status === "select") {
        this._btn.innerHTML = "Edit and press to take superpose image";
    }
    else if (status === "forbid") {
        let coords = this._video.getBoundingClientRect();
        let canvas = this._videoContainer.querySelector("canvas");
        let img = null;
        if (this._video.tagName === "VIDEO") {
            canvas.setAttribute("width", coords.width);
            canvas.setAttribute("height", coords.height);
            canvas.getContext("2d").drawImage(video, 0, 0, coords.width, coords.height);
            img = canvas.toDataURL("image/png");
        }
        this.sendImg(img);
        this._btn.disabled = true;
        this._btn.classList.toggle("active");
        this._btn.innerHTML = "Choose the image. before starting";
    }
}
VideoView.prototype.setSelectedImage = function() {
    let img = this._cloneImage;
    let setV = this._videoSettings;
    if (!img) {
        img = this._selected.cloneNode(true);
        this.getCurrentVideoParams();
        img.classList.add("clone-image");
        img.style.width = this._size * setV.currentScale + "px";
        this._videoContainer.appendChild(img);
        img.onmousedown = function(event) { this.emit("dragAndDrop", event); return false }.bind(this);
        this.emit("addCrossBrowserWhellListener", img);
        this._cloneImage = img;
        setV.posX = 50 - img.clientWidth / setV.currentScale / 2 / setV.w * 100;
        setV.posY = 50 - img.clientHeight / setV.currentScale / 2 / setV.h * 100;
    }
    img.style.left = setV.posX + "%";
    img.style.top = setV.posY + "%";
    this.getCurrentImageParams();
}
VideoView.prototype.scopeImg = function(e) {
    let elemCoords = this._cloneImage.getBoundingClientRect();
    let videoCoords = this._video.getBoundingClientRect();
    let setV = this._videoSettings;
    let setI = this._imageSettings;
    let width = setI.w * setV.currentScale;
    let height = setI.h * setV.currentScale;
    let scale = setI.wheelScale;
    let bottomEdge = videoCoords.top + videoCoords.height;
    let rightEdge = videoCoords.left + videoCoords.width;
    let bottom = elemCoords.top + height * scale;
    let right = elemCoords.left + width * scale;
    if (bottom < bottomEdge && right < rightEdge) {
        this._cloneImage.style.width = width * setI.wheelScale + "px";
        this._imageSettings.precH =
            this._cloneImage.clientHeight /
            setV.currentScale /
            setV.h * 100;
        this._imageSettings.precW =
            this._cloneImage.clientWidth /
            setV.currentScale /
            setV.w * 100;
        return 1;
    }
    return 0;
}
VideoView.prototype.getCurrentVideoParams = function() {
    if (this._video) {
        let set = this._videoSettings;
        set.coords = this._video.getBoundingClientRect();
        set.currentScale = set.coords.width / set.w;
        this._videoContainer.style.height = this._model._videoSettings.height * set.currentScale + "px";
    }
}
VideoView.prototype.getCurrentImageParams = function() {
    let setV = this._videoSettings;
    if (this._cloneImage) {
        let set = this._imageSettings;
        let img = this._cloneImage;
        set.h = img.clientHeight / setV.currentScale;
        set.w = img.clientWidth / setV.currentScale;
        set.precH = set.h / setV.h * 100;
        set.precW = set.w / setV.w * 100;
        set.posX = (img.getBoundingClientRect().left - setV.coords.left) / setV.currentScale / setV.w * 100;
        set.posY = (img.getBoundingClientRect().top - setV.coords.top) / setV.currentScale / setV.h * 100;
    }
}


function VideoController(view, model, name) {
    EventEmiter.apply(this, arguments);
    this._name = name;
    this._model = model;
    this._view = view;
    this._streamExist = null;
    this.on("runStream", function(elem) { this.runStream(elem) }.bind(this));
    this.on("allowSuperpose", function(img) { this._view.changeBtnStatus("allow", img) }.bind(this));
    this._view._btn.onmousedown = function() { this.selectImage() }.bind(this);
    this._view.on("dragAndDrop", function() { this.dragAndDrop(event) }.bind(this));
    this._view.on("addCrossBrowserWhellListener", function(img) { this.addOnWheel(img) }.bind(this));
    this._view.on("addImageToCarousel", function() { this.send("loadCarouselContent", "carousel2") }.bind(this));
    window.addEventListener("resize", function() { this.shiftCloneImage() }.bind(this));
}
VideoController.prototype = Object.create(EventEmiter.prototype);
VideoController.prototype.constructor = VideoController;
VideoController.prototype.runStream = function(elem) {
    if (!this._streamExist) {
        if (elem.tagName === "VIDEO") {
            this._view._video = elem;
            let video = this._view._video;
            video.style.display = "block";
            navigator.mediaDevices.getUserMedia({
                audio: false,
                video: true
            }).then(function(stream) {
                video.srcObject = stream;
            }).catch(console.error);
        }
        else {
            this._view._video = elem["img"];
            this._view._videoSettings["w"] = elem["width"];
            this._view._videoSettings["h"] = elem["height"];
            this._model._videoSettings = elem;
            this.shiftCloneImage();
        }
        this.startStream = null;
        this._streamExist = true;
    }
    else {
        this.shiftCloneImage();
    }
}
VideoController.prototype.selectImage = function() {
    this.send("toggleCarouselVisibility", "carousel");
    if (!this._view._cloneImage) {
        this._view.changeBtnStatus("select");
        this._view.setSelectedImage();
    }
    else {
        let img = this._view._cloneImage;
        this._view.changeBtnStatus("forbid");
        img.parentNode.removeChild(img);
        this._view._cloneImage = null;
        this._view._imageSettings.wheelScale = 1;
        this._view._videoSettings.currentScale = 1;
    }
}
VideoController.prototype.dragAndDrop = function(event) {
    let elem = event.target;
    let elemCoords = elem.getBoundingClientRect();
    let offsetX = event.clientX - elemCoords.left;
    let offsetY = event.clientY - elemCoords.top;
    let self = this;
    let videoCoords = self._view._video.getBoundingClientRect();
    let setI = self._view._imageSettings;
    let setV = self._view._videoSettings;
    moveElem(event); 
    function moveElem(event) {
        let x = event.clientX - videoCoords.left - offsetX;
        let y = event.clientY - videoCoords.top - offsetY;
        let top = y / setV.currentScale / setV.h * 100;
        let left = x / setV.currentScale / setV.w * 100;
        if (top < 0) top = 0;
        // else if (top > 99 - setI.precH) top = 99.5 - setI.precH;
        else if (top > 100 - setI.precH) top = 100 - setI.precH;
        if (left < 0) left = 0;
        else if (left > 100 - setI.precW) left = 100 - setI.precW;
        elem.style.top = top + "%";
        elem.style.left = left + "%";
        self._view._imageSettings.posX = left;
        self._view._imageSettings.posY = top;
    }
    document.onmouseup = function() {
        this.onmousemove = null;
    }
    document.onmousemove = function(event) {
        moveElem(event);
    };
}
VideoController.prototype.addOnWheel = function(elem) {
    let listener = this.resizeImg;
    if (elem.addEventListener) {
        if ('onwheel' in document) {
            elem.addEventListener("wheel", listener.bind(this));
        } else if ('onmousewheel' in document) {
            // устаревший вариант события
            elem.addEventListener("mousewheel", listener.bind(this));
        } else {
            // 3.5 <= Firefox < 17, более старое событие DOMMouseScroll пропустим
            elem.addEventListener("MozMousePixelScroll", listener.bind(this));
        }
    } else { // IE8-
        text.attachEvent("onmousewheel", listener.bind(this));
    }
}
VideoController.prototype.resizeImg = function(e) {
    var delta = e.deltaY || e.detail || e.wheelDelta;
    if (delta > 0) this._view._imageSettings.wheelScale += 0.05;
    else this._view._imageSettings.wheelScale -= 0.05;
    if (!this._view.scopeImg(e)) {
        if (delta > 0) this._view._imageSettings.wheelScale -= 0.05;
        else this._view._imageSettings.wheelScale += 0.05;
    }
    e.preventDefault();
}
VideoController.prototype.shiftCloneImage = function(e) {
    let setI = this._view._imageSettings;
    let setV = this._view._videoSettings;
    this._view.getCurrentVideoParams();
    if (this._view._cloneImage) {
        this._view._cloneImage.style.width = setI.w * setV.currentScale * setI.wheelScale + "px";
    }
}
