"use strict";

function CarouselModel(settings) {
    EventEmiter.apply(this, arguments);
    this._settings = settings;
    this._imagesCount = settings.imagesCount;
    this._imageSize = settings.elemWidth;
}
CarouselModel.prototype = Object.create(EventEmiter.prototype);
CarouselModel.prototype.constructor = CarouselModel;


function CarouselView(model, container) {
    EventEmiter.apply(this, arguments);
    this._container = container;
    this._model = model;
    this._carousel = document.getElementById("carousel");
    this._imageList = this._carousel.querySelector("#superposable-images");
    this._selected = null; // current selected image
    this._currentShift = null; //curent marginLeft value for list images
    this._currentCountImages = 2; //curent count images relative screen size
    window.addEventListener("resize", function() { this.resizeCarousel() }.bind(this));
}
CarouselView.prototype = Object.create(EventEmiter.prototype);
CarouselView.prototype.constructor = CarouselView;
CarouselView.prototype.toggleSelect = function(img) {
    if (this._selected) this._selected.parentNode.classList.toggle("selected");
    img.parentNode.classList.toggle("selected");
    this._selected = img;
    let data = {
        img: img,
        size: this.emit("getImageSize")
    }
    this.emit("allowSuperpose", data);
}
CarouselView.prototype.showNext = function() {
    let countImages = this._model._imagesCount;
    this._currentShift = Math.max(
        this._currentShift - this._model._imageSize * this._currentCountImages,
        -this._model._imageSize * (countImages - this._currentCountImages));
    if (this._imageList) {
        this._imageList.style.marginLeft = this._currentShift + "px";
    }
    else throw new Error ("Image list inside carousel not found");
}
CarouselView.prototype.showPrev = function() {
    let countImages = this._model._imagesCount;
    this._currentShift = Math.min(
    this._currentShift + this._model._imageSize * this._currentCountImages,
    0);
    if (this._imageList) {
        this._imageList.style.marginLeft = this._currentShift + "px";
    }
    else throw new Error ("Image list inside carousel not found");
}
CarouselView.prototype.resizeCarousel = function() {
    if (this._carousel) {
        let carouselWidth = this._carousel.clientWidth;
        let carouselContainer = this._carousel.querySelector("#superposable-images-container");
        if (carouselWidth < this._model._imageSize * 1 + 300) {
            carouselContainer.style.width = this._model._imageSize * 1 + "px";
            this._currentCountImages = 1;
        }
        else if (carouselWidth < this._model._imageSize * 2 + 300) {
            carouselContainer.style.width = this._model._imageSize * 2 + "px";
            this._currentCountImages = 2;
        }
        else {
            carouselContainer.style.width = this._model._imageSize * 3 + "px";
            this._currentCountImages = 3;
        }
    }
}
CarouselView.prototype.toggleCarouselVisibility = function(event) {
    if (this._carousel.style.visibility === "hidden") {
        this._carousel.style.visibility = "visible"
    }
    else {
        this._selected.parentNode.classList.toggle("selected");
        this._selected = null;
        this._carousel.style.visibility = "hidden"
    }
}

function CarouselController(view, model, name){
    EventEmiter.apply(this, arguments);
    this._name = name;
    this._model = model;
    this._view = view;
    this._view.on("allowSuperpose", function(img) {
        if (this._name === "carousel") {
            this.send("allowSuperpose", "video", img)
        };
    }.bind(this));
    this._view.on("resizeCarousel", function() { this.resizeCarousel() }.bind(this));
    this._view.on("getImageSize", function() { return this._model._imageSize }.bind(this));
    this.on("showCarousel", function() { this.showCarousel() }.bind(this));
    this.on("toggleCarouselVisibility", function() { this._view.toggleCarouselVisibility() }.bind(this));
}
CarouselController.prototype = Object.create(EventEmiter.prototype);
CarouselController.prototype.constructor = CarouselController;
CarouselController.prototype.showCarousel = function() {
    if (this._view._carousel) {
        this._view._carousel.style.visibility = "visible";
        this._view._carousel.onmousedown = function(event) {
            let target = event.target;
            
            let tag = target.tagName;
            if (tag === "IMG") this._view.toggleSelect(target);
            else if (target.id === "prev") this._view.showPrev();
            else if (target.id === "next") this._view.showNext();
            return false;
        }.bind(this);
        this._view.resizeCarousel();
    }
    else {
        throw new Error ("Carousel had't found");
    }
}


// horizontal

function HCarouselModel(settings) {
    CarouselModel.apply(this, arguments);
    this._settings = settings;
    this._images = settings.elemSrcs;
    this._imageSize = settings.elemWidth;
}
HCarouselModel.prototype = Object.create(CarouselModel.prototype);
HCarouselModel.prototype.constructor = HCarouselModel;


function HCarouselView(model, container) {
    CarouselModel.apply(this, arguments);
    this._container = container;
    this._model = model;
    this._carousel = document.getElementById("carousel2");
    this._imageList = this._carousel.querySelector("#superposable-images");
    this._selected = null; // current selected image
    this._currentShift = null; //curent marginLeft value for list images
    this._currentCountImages = 4; //curent count images relative screen size
}
HCarouselView.prototype = Object.create(CarouselView.prototype);
HCarouselView.prototype.constructor = HCarouselView;
HCarouselView.prototype.showNext = function() {
    let countImages = this._model._imagesCount;
    this._currentShift = Math.max(
        this._currentShift - this._model._imageSize * this._currentCountImages,
        -this._model._imageSize * (countImages - this._currentCountImages));
    if (this._imageList) {
        this._imageList.style.marginTop = this._currentShift + "px";
    }
}
HCarouselView.prototype.showPrev = function() {
    let countImages = this._model._imagesCount;
    this._currentShift = Math.min(
        this._currentShift + this._model._imageSize * this._currentCountImages,
        0);
    if (this._imageList) {
        this._imageList.style.marginTop = this._currentShift + "px";
    }
}
HCarouselView.prototype.toggleArrowVisability = function() {
    let prev = this._carousel.querySelector("#prev");
    let next = this._carousel.querySelector("#next");
    if (this._model._imagesCount < this._currentCountImages) {
        prev.style.display = "none";
        next.style.display = "none";
    }
    else {
        prev.style.display = "block";
        next.style.display = "block";
    }
}
HCarouselView.prototype.addImages = function(data) {
    let imgs = JSON.parse(data);
    let box = this._carousel.querySelector("#superposable-images");
    box.innerHTML = "";
    this._model._imagesCount = 0;
    for (let i = 0; i < imgs.length; i++) {
        let div = document.createElement("div");
        div.classList.add("image-container");
        div.innerHTML = "<img src=" + imgs[i]["path"] + "></img><i class='fas fa-times' data-id=" + imgs[i]["id"] + "></i>"
        box.appendChild(div);
        this._model._imagesCount++;
    }
    this.toggleArrowVisability();
}
HCarouselView.prototype.resizeCarousel = function() {
    if (this._carousel) {
        let carouselHeight = this._carousel.clientHeight;
        let carouselContainer = this._carousel.querySelector("#superposable-images-container");
        carouselContainer.style.height = this._model._imageSize * 4 + "px";
        this._currentCountImages = 4;
    }
}

function HCarouselController(view, model, name) {
    CarouselController.apply(this, arguments);
    this._name = name;
    this._model = model;
    this._view = view;
    this.on("showHCarousel", function() { this.showCarousel() }.bind(this));
    this.on("loadCarouselContent", function() { this.loadCarouselContent() }.bind(this));
    this._view.on("resizeCarousel", function() { this.resizeCarousel() }.bind(this));
    this._view.on("toggleCarouselVisibility", function() { this.toggleCarouselVisibility() }.bind(this));
    this._model.on("getCloneImageSize", function() { return this._model._imageSize }.bind(this));
}
HCarouselController.prototype = Object.create(CarouselController.prototype);
HCarouselController.prototype.constructor = HCarouselController;
HCarouselController.prototype.loadCarouselContent = function() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', "./index.php?page=thumbnails", true);
    let csrfCookie = document.cookie.match(/token=(.*?$)/);
    if (csrfCookie) {
        xhr.setRequestHeader("X-CSRF-TOKEN", csrfCookie[1]);
    }
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.send();
    xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) return;
    
        if (xhr.status != 200) {
            alert(xhr.status + ': ' + xhr.statusText);
        } else {
            this._view.addImages(xhr.responseText);
            this._view._carousel.querySelector("#superposable-images").onclick = function(event) {
                this.carouselListener(event)
            }.bind(this);
        }
    }.bind(this)
}
HCarouselController.prototype.carouselListener = function(event) {
    let target = event.target;
    if (target.tagName === "I") {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', "./index.php?page=thumbnails&delete=" + target.dataset.id, true);
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
                if (xhr.responseText === "delete") {
                    target.parentNode.parentNode.removeChild(target.parentNode);
                    this._model._imagesCount--;
                    this._view.toggleArrowVisability();
                }

            }
        }.bind(this);
    }
}
HCarouselController.prototype.showCarousel = function() {
    CarouselController.prototype.showCarousel.apply(this, arguments);
    this.loadCarouselContent();
}
