"use strict";

function Mediator(name) {
    this._name = name;
    this.childs = {};
    this.events = {};
    this.mediator = null;

    this.sendParent = function(message, to) {
        this.mediator.send(message, this, to);
    }
    this.on = function(event, listener) {
        (this.events[event] || (this.events[event] = [])).push(listener);
    },
    this.register = function(child) {
        this.childs[child._name] = child;
        child.mediator = this;
    }
    this.send = function(message, from, to, arg) {
        if (to) {
            this.childs[to].receive(message, from, arg);    
        } else {
            for (let child in this.childs) {
                if (this.childs[child] !== from) {
                    this.childs[child].receive(message, from, arg);
                }
            }
        }
    }
    this.receive = function(message, from, arg) {
        this.emit(message, arg);
    }
    this.emit = function(event, arg) {
        let ret;
        (this.events[event] || []).slice().forEach(function(eventListener) {
            ret = eventListener(arg);
        });
        return ret
    }
}

function EventEmiter(name) {
    this.name = name;
    this.mediator = null;
    this.events = {};
}
EventEmiter.prototype = {
    loadPage: function(pageSrc, func) {
        let script = document.createElement("script");
        script.setAttribute("src", pageSrc);
        script.addEventListener("load", func);
        document.body.appendChild(script);
    },
    send: function(message, to, arg) {
        this.mediator.send(message, this, to, arg);
    },
    receive: function(message, from, arg) {
        this.emit(message, arg)
    },
    on: function(event, listener) {
        (this.events[event] || (this.events[event] = [])).push(listener);
    },
    emit: function(event, arg) {
        let ret;
        (this.events[event] || []).slice().forEach(function(eventListener) {
            ret = eventListener(arg);
        });
        return ret
    },
    render: function(data, args) {
        let newNode
        if (data.tag) {
            newNode = document.createElement(data.tag);
            if (data.id) {
                newNode.id = data.id;
            }
            if (data.attr) {
                for (let at in data.attr) {
                    newNode.setAttribute(at, data.attr[at])
                }
            }
            if (data.class) {
                let classes = data.class.split(" ");
                for (let i = 0; i < classes.length; i++) {
                    newNode.classList.add(classes[i]);
                }
            }
            if (data.content) {
                if (typeof(data.content) === "object") {
                    for (let elem in data.content) {
                        newNode.appendChild(this.render(data.content[elem]));
                    }
                }
                else {
                    newNode.innerHTML = data.content;
                }
            }
        }
        return newNode;
    }
}
