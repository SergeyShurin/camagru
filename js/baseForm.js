"use strict";

function FormModel(settings) {
    EventEmiter.apply(this, arguments);
    this._getForm = function(callback) {
        if (settings.src) {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', "./index.php?getform=" + settings.src + "&page=form", true);
            let csrfCookie = document.cookie.match(/token=(.*?$)/);
            if (csrfCookie) {
                xhr.setRequestHeader("X-CSRF-TOKEN", csrfCookie[1]);
            }
            xhr.setRequestHeader('Content-type', 'application/json; charsset=utf-8');
            xhr.send();
            xhr.onreadystatechange = function() {
                if (xhr.readyState != 4) return;
                if (xhr.status != 200) {
                    alert(xhr.status + ': ' + xhr.statusText);
                } else {
                    let obj = (JSON.parse(xhr.responseText));
                    callback(obj["render"]);
                }
            }
        }
        else {
            throw Error("Absent src, cant send request to recieve form template");
        }
    }
}
FormModel.prototype = Object.create(EventEmiter.prototype);
FormModel.prototype.constructor = FormModel;
FormModel.prototype.sendForm = function(query, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', "./index.php" + query + "&page=form&sendform=true", true);
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
            callback(xhr.responseText);
        }
    }
}


function FormView(model) {
    EventEmiter.apply(this, arguments);
    this._model = model;
    this._form = null;
    this._keyField = null;
}
FormView.prototype = Object.create(EventEmiter.prototype);
FormView.prototype.constructor = FormView;
FormView.prototype.renderForm = function(data) {
    if (data) {
        let form = this.render(data);
        for (let i = 0; i < form.length; i++) {
            this.emit("addListener", form[i]);
        }
        this._form = form;
    }
}
FormView.prototype.fadeForm = function() {
    if (this._form) {
        this._form.style.display = "none";
    }
};
FormView.prototype.clearForm = function() {
    let form = this._form;
    if (form) {
        for (let i = 0; i < form.length - 1; i++) {
            form[i].value = "";
            form[i].classList.remove("valid");
            form[i].classList.remove("invalid");
        }
    }
    if (this._keyField) {
        this._keyField.parentNode.removeChild(this._keyField);
        this._keyField = null;
    }
}


function FormController(view, model, name) {
    EventEmiter.apply(this, arguments);
    this._name = name;
    this._model = model;
    this._view = view;
    this._view.on("addListener", function(elem) { this.addListeners(elem) }.bind(this));
    this.on("checkValid", function() { this.checkValid() }.bind(this));
    this.on("showForm", function() { this.showForm() }.bind(this));
    this.on("fadeForm", function() { this._view.fadeForm() }.bind(this));
    this.on("clearForm", function() { this._view.clearForm() }.bind(this));
}
FormController.prototype = Object.create(EventEmiter.prototype);
FormController.prototype.constructor = FormController;
FormController.prototype.checkValid = function() {
    let form = this._view._form;
    let valid = 0;
    for (let i = 0; i < form.length; i++) {
        if (form[i].type === "text" && this.nameValid(form[i].value)) valid++;
        if (form[i].type === "password" && this.passValid(form[i].value)) valid++;
        if (form[i].type === "email" && this.mailValid(form[i].value)) valid++;
    }
    if (valid + 1 === form.length) {
        form.lastChild.disabled = false;
    }
}
FormController.prototype.confirmAccess = function(callback) {
    let elems = this._view._form.elements;
    let query = "?";
    for (let i = 0; i < elems.length; i++) {
        query += (elems[i].name || elems[i].type) + "=" + elems[i].value;
        if (i != elems.length - 1) query += "&";
    }
    this._model.sendForm(query, callback);
}
FormController.prototype.parseResponse = function(xhrResponse) {
    let response = (JSON.parse(xhrResponse));
    if (response.status === "exist") {
        this.send("submit");
        this.emit("fadeForm");
        this.send("fadeForm");
        this.emit("clearForm");
        this.send("clearForm");
    }
    else if (response.status === "key") {
        let form = this._view._form;
        if (!this._view._keyField) {
            let input = document.createElement("input");
            input.setAttribute("type", "text");
            input.setAttribute("placeholder", "input key from your mail");
            input.setAttribute("name", "key");
            input.classList.add("input");
            form.insertBefore(input, form.lastChild);
            this._view._keyField = input;
        }
    }
    else {
        if (response.status === "user created") {
            this.emit("fadeForm");
        }
        alert(response.status);
    };
}
FormController.prototype.addListeners = function(elem) {
    let self = this;
    if (elem.type === "submit") {
        elem.onmousedown = function(event) {
            this.confirmAccess(function(xhrResponse) {
                this.parseResponse(xhrResponse);
            }.bind(this));
        }.bind(this);
        elem.onclick = function() {
            return false;
        };
    }
    else if (elem.type === "text") {
        elem.onkeydown = function() {
            if (self.nameValid(this.value)) {
                if (!this.classList.contains("valid")) this.classList.add("valid");
                if (this.classList.contains("invalid")) this.classList.remove("invalid");
            }
            else {
                if (this.classList.contains("valid")) this.classList.remove("valid");
                if (!this.classList.contains("invalid")) this.classList.add("invalid");
            }
            self.checkValid();
        }
    }
    else if (elem.type === "password") {
        elem.onkeydown = function() {
            if (self.passValid(this.value)) {
                if (!this.classList.contains("valid")) this.classList.add("valid");
                if (this.classList.contains("invalid")) this.classList.remove("invalid");
            }
            else {
                if (this.classList.contains("valid")) this.classList.remove("valid");
                if (!this.classList.contains("invalid")) this.classList.add("invalid");
            }
            self.checkValid();
        }
    }
    else if (elem.type === "email") {
        elem.onkeydown = function() {
            if (self.mailValid(this.value)) {
                if (!this.classList.contains("valid")) this.classList.add("valid");
                if (this.classList.contains("invalid")) this.classList.remove("invalid");
            }
            else {
                if (this.classList.contains("valid")) this.classList.remove("valid");
                if (!this.classList.contains("invalid")) this.classList.add("invalid");
            }
            self.checkValid();
        } 
    }
}  
FormController.prototype.nameValid = function(text) {
    let len = text.length + 1;
    if (len > 3 && len < 15) {
        return 1;
    }
    return 0;
}
FormController.prototype.passValid = function(text) {
    let len = text.length + 1;
    if (len > 5 && len < 15) {
        return 1;
    }
    return 0;
}
FormController.prototype.mailValid = function(text) {
    let index = text.indexOf("@");
    if (index !== -1 && index !== text.length) {
        return 1;
    }
    return 0;
}
FormController.prototype.showForm = function() {
    if (!this._view._form) {
        this._model._getForm(function(data) {
            this._view.renderForm(data);
            document.body.appendChild(this._view._form);
        }.bind(this));
    }
    else if (this._view._form.style.display === "none") {
        this._view._form.style.display = "flex";
    }
}

let initForm = function(settings, name) {
    const formModel = new FormModel(settings);
    const formView = new FormView(formModel);
    const formController = new FormController(formView, formModel, name);

    return formController;
}

const loginForm = initForm({
    src: "./data/loginForm.json"
}, "logForm");
const regForm = initForm({
    src: "./data/regForm.json"
}, "regForm");
mediator.register(loginForm);
mediator.register(regForm);
