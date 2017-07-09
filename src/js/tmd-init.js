const __map = Array.prototype.map;
/**
 * create a doc Element
 * @param {string} nodeName
 * @param {object} properties - object of properties to assign to the element
 * @returns {HTMLElement}
 */
const __create = function (nodeName, properties = {}) {
    const node = document.createElement(nodeName);
    Object.assign(node,properties);
    return node;
};

/**
 * Wrapper function for callbacks. Checks if the callback is a function and 
 * then calls it
 * Imporant: call this function via the call param and set the class instance of TmDropdown as this
 * @param {string} name
 * Name of callback (without on, like "Open" or "Rendered")
 * @param {mixed} param
 * a secondary parameter to be passed to the callback
 * @returns {mixed}
 * returns the return value of the callback
 */
const __callCallback = function(name, param = undefined) {
    const onFn = this.getOption("on" + name);
    (typeof onFn === 'function') && onFn.call(this._domElement, this, param);
};