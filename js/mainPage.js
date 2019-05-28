"use strict";

let settings = {
    width: 770,
    height: 577.5
}

let initVideo = function(name) {
    const videoModel = new VideoModel(settings);
    const videoView = new VideoView(videoModel, document.querySelector("#general"));
    const videoController = new VideoController(videoView, videoModel, name);

    return videoController;
}

let initCarousel = function(name, elem) {
    
    let settings = {
        elemWidth: 204,
        imagesCount: 6
    }
    
    const carouselModel = new CarouselModel(settings);
    const carouselView = new CarouselView(carouselModel, elem);
    const carouselController = new CarouselController(carouselView, carouselModel, name);

    return carouselController;
}

let initCarousel2 = function(name, elem) {

    let settings = {
        elemWidth: 200,
        imagesCount: 0
    }
    const carouselModel = new HCarouselModel(settings);
    const carouselView = new HCarouselView(carouselModel, elem);
    const carouselController = new HCarouselController(carouselView, carouselModel, name);
    return carouselController;
}



let initMainPage = function(name, elem) {

    function MainPage(name, elem) {
        Mediator.apply(this, arguments);
        this._main = elem;
        this.on("openMainPage", function() { this.renderMainContent() }.bind(this));
    }
    MainPage.prototype = Object.create(Mediator.prototype);
    MainPage.prototype.loadOtherContent = function(btns) {
        btns[0].style.display = "none";
        btns[1].style.display = "none";
        this.send("showCarousel", this, "carousel");
    }
    MainPage.prototype.saveImage = function(file) {
        let data = new FormData();
        data.append("afile", file);
        let xhr = new XMLHttpRequest();
        xhr.open('POST', '../controller/saveImage.php', true);
        let csrfCookie = document.cookie.match(/token=(.*?$)/);
        if (csrfCookie) {
            xhr.setRequestHeader("X-CSRF-TOKEN", csrfCookie[1]);
        }
        xhr.onload = function() {
            if (xhr.status != 200) {
                alert(xhr.status + ': ' + xhr.statusText);
            } else {
                this.appendImageToPage(file);
            }
        }.bind(this);
        xhr.send(data);
    }
    MainPage.prototype.appendImageToPage = function(file) {
        let _URL = window.URL || window.webkitURL;
        let img = new Image();
        let obj = {};
        img.onload = function () {
            obj["width"] = img.width;
            obj["height"] = img.height;
            img.style.width = "100%";
            this._main.querySelector("#video-container").appendChild(img);
            obj["img"] = img;
            this.send("runStream", this, "video", obj);
        }.bind(this);
        img.src = _URL.createObjectURL(file);
    }
    MainPage.prototype.renderMainContent = function() {
        this.send("showHCarousel", this, "carousel2");
        this._main.style.display = "flex";
        let box = this._main.querySelector("#video-container");
        let btns = box.querySelectorAll("input");
        btns[0].onclick = function() {
            this.send("runStream", this, "video", box.querySelector("#video"));
            this.loadOtherContent(btns)
        }.bind(this);
        btns[1].onchange = function() {
                let file = btns[1].files[0];
                if (file) {
                    if (file.type.startsWith('image/png')) {
                        this.saveImage(file);
                        this.loadOtherContent(btns)
                    }
                    else {
                        alert("should choose png image");
                    }
                }
        }.bind(this);
    }

    const video = initVideo("video");
    const carousel = initCarousel("carousel", document.getElementById("carousel-container"));
    const carousel2 = initCarousel2("carousel2", document.getElementById("side"));
    const mainPage = new MainPage(name, elem);
    mainPage.register(video);
    mainPage.register(carousel);
    mainPage.register(carousel2);
    return mainPage; 
}

function initMain() {
    const mainPage = initMainPage("mainPage", document.getElementById("main"));
        
    mediator.register(mainPage);
}

initMain();