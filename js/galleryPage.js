let initImageList = function(elem, name) {
    let settings = {
    }
    
    const imageListModel = new ImageListModel(settings);
    const imageListView = new ImageListView(imageListModel, elem);
    const imageListController = new ImageListController(imageListView, imageListModel, name);

    return imageListController;
}

let initGalleryData = function(elem, name) {
    let settings = {
        count: 6,
    };

    const galleryModel = new GalleryModel(settings);
    const galleryView = new GalleryView(galleryModel, elem);
    const galleryController = new GalleryController(galleryView, galleryModel, name);

    return galleryController;
}

let initGalleryPage = function(name) {

    function GalleryPage() {
        Mediator.apply(this, arguments);
        this.on("openGalleryPage", function() { this.send("showGallery", this, "gallery"); }.bind(this));
        this.on("logout", function() { this.send("showGallery", this, "gallery"); }.bind(this));
        this.on("submit", function() { this.send("hideGallery", this, "gallery"); }.bind(this));
    }
    GalleryPage.prototype = Object.create(Mediator.prototype);

    const gallery = initGalleryData(document.getElementById("gallery"), "gallery");
    const imageList = initImageList(document.getElementById("general"), "imageList");
    const galleryPage = new GalleryPage(name);
    galleryPage.register(gallery);
    galleryPage.register(imageList);
    return galleryPage; 
}

function initGallery() {
    const galleryPage = initGalleryPage("galleryPage");
        
    mediator.register(galleryPage);
}

initGallery();