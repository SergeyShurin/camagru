let initProfilePage = function(name) {

    function GalleryPage() {
        Mediator.apply(this, arguments);
        this.on("openProfilePage", function() { this.setListener() }.bind(this));
        this.getCheckedStatus = function(path) {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', "./index.php?page=profile&getuser=true", true);
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
                    let statusNotif = JSON.parse(xhr.responseText)[0]["allow_notif"];
                    if (statusNotif === "Y") {
                        notif.checked = true;
                    }
                    else if (statusNotif === "N") {
                        notif.checked = false;
                        
                    };
                }
            }
        }
        this.changeProfile = function(path) {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', path, true);
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
                    alert(xhr.responseText);
                }
            }
        } 
        this.setListener = function() {
            this.getCheckedStatus();
            profile.onclick = function(event) {
                target = event.target;
                if (target.id === "user_btn") {
                    if (user_input.value) {
                        this.changeProfile("./index.php?page=profile&user=" + user_input.value);
                    }
                }
                else if (target.id === "pass_btn") {
                    if (pass_input.value) {
                        this.changeProfile("./index.php?page=profile&pass=" + pass_input.value);
                    }
                }
                else if (target.id === "mail_btn") {
                    if (mail_input.value) {
                        this.changeProfile("./index.php?page=profile&mail=" + mail_input.value);
                    }
                }
                else if (target.id === "notif" || target.tagName === "label") {
                    if (notif.checked) {
                        this.changeProfile("./index.php?page=profile&allow=true");
                    }
                    else {
                        this.changeProfile("./index.php?page=profile&forbid=true");
                    }
                }
            }.bind(this);
        }
    }
    GalleryPage.prototype = Object.create(Mediator.prototype);

    const galleryPage = new GalleryPage(name);
    return galleryPage; 
}

function initProfile() {
    const galleryPage = initProfilePage("profilePage");
    mediator.register(galleryPage);
}

initProfile();