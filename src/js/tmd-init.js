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