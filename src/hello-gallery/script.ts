declare var component_name:string;
declare var component_id:string;
var owner = document['_currentScript'].ownerDocument;
var tmpl = owner.getElementById(component_id);
var prototype = Object.create(HTMLElement.prototype);
prototype.createdCallback = function () {
    var root = this.createShadowRoot();
    var clone = document.importNode(tmpl['content'], true);
    root.appendChild(clone);
};
document['registerElement'](component_name, {
    prototype: prototype
});

