/* global TmDropdown, __map */

/**
 * Event Delegator for TmDropdown
 */
class TmDropdownDelegator {

    constructor() {
        this.collection = [];
        window.addEventListener("scroll", this._windowScroll.bind(this), true);

    }
    /**
     * Add an instance of TmDropdown to the Delegator
     * @param {TmDropdown} item
     */
    add(item) {
        if (!(item instanceof TmDropdown)) {
            throw "TmDropdownDelegator - added item is not an instance of TmDropdown";
        }
        if (this.collection.indexOf(item) === -1) {
            this.collection.push(item);
        }
    }
    /**
     * Remove an instance of TmDropdown from the Delegator
     * @param {TmDropdown} item
     */
    remove(item) {
        const index = this.collection.indexOf(item);
        if (index !== -1) {
            this.collection.splice(index, 1);
        }
    }
    /**
     * Event Handler for window scroll event
     * @param {Event} event - Scroll Event passed by EventListener
     * @returns {undefined}
     * @internal
     */
    _windowScroll(event) {
        __map.call(this.collection, function (item) {
            if (item.isOpen && !item.isEventTarget(event)) {
                item.getOption("closeOnScroll") ? item.close() : item.repositionOptionsUL();
            }
        });
    }
}
//define tmDropdownDelegator in local scope since it is only used internally
const tmDropdownDelegator = new TmDropdownDelegator();