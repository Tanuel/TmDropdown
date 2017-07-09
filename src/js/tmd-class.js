/* global tmdc, TmDropdownConfig, tmDropdownDelegator, __map, __create */

/** ----- TmDropdown main class ----- 
 * You can set default options in TmDropdownConfig
 */
class TmDropdown {

    /**
     * 
     * @param {HTMLSelectElement} domElement - A select element from the DOM. If it is not a Select, an error is thrown
     * @param {Object} options - (Optional) An object with options. Available options are documented in the global TmDropdownConfig variable
     * @returns {TmDropdown}
     */
    constructor(domElement, options = undefined) {
        if (domElement.nodeName.toUpperCase() !== 'SELECT') {
            throw "Element is not a Select";
        }

        this._domElement = domElement;
        this._options = (typeof options === 'object') && Object.assign({}, TmDropdownConfig, options) || {};

        this._dropdown = __buildDropdown(this);//this._buildDropdown();
        Object.assign(domElement.style, {
            visibility: "hidden",
            position: "absolute"
        });
        domElement.parentNode.insertBefore(this._dropdown, domElement.nextSibling);
        domElement.TmDropdown = this;

        tmDropdownDelegator.add(this);

        if (this.getOption("observe")) {
            let obs = new MutationObserver(this.refresh.bind(this));
            var config = {
                attributes: true,
                childList: true,
                characterData: true,
                subtree:true
            };
            obs.observe(domElement, config);
            this._observer = obs;
        }

         __callCallback.call(this,"Rendered");
    }

    /**
     * indicates wether the dropdown is currently opened or not
     * @type boolean
     */
    get isOpen() {
        return this._dropdown.classList.contains(tmdc.open);
    }

    /**
     * indicates if the dropdown contains any options
     * @type boolean
     */
    get isEmpty() {
        return (this._domElement.children.length === 0);
    }
    /**
     * indicates if the dropdown is multiple
     * @type boolean
     */
    get isMultiple() {
        return this._domElement.multiple;
    }
    
    /**
     * The observer observing the original select
     * @type MutationObserver
     */
    get observer() {
        return this._observer;
    }
    /**
     * tells if anything in this dropdown is targeted by the specified event
     * @param {Event} event -  a native event
     * @returns {boolean}
     */
    isEventTarget(event) {
        return  this._dropdown === event.target ||
                this._dropdown.contains(event.target) ||
                this._optionsUL === event.target ||
                this._optionsUL.contains(event.target);
    }

    isOptlistEventTarget(event) {
        return this._optionsUL === event.target ||
                this._optionsUL.contains(event.target);
    }

    /**
     * returns the currently selected li (not the option!)
     * returns null for multiple select!
     * @type HTMLLiElement
     */
    get selectedElement() {
        return this.isMultiple ? null : this._optionsUL.getElementsByClassName(tmdc.selected)[0];
    }
    /**
     * returns the currently hovered li (not the option!)
     * @type HTMLLiElement
     */
    get hoveredElement() {
        let hovered = this._optionsUL.getElementsByClassName(tmdc.hover)[0];
        if (!hovered && !this.isMultiple) {
            hovered = this.selectedElement;
        }
        return hovered;
    }

    /**
     * get an option
     * @param {string} key
     * @returns {string} option value
     */
    getOption(key) {
        switch (key) {
            case 'width':
                return this._options.width || TmDropdownConfig[key] || window.getComputedStyle(this._domElement).width;
            default:
                return this._options[key] !== undefined ? this._options[key] : TmDropdownConfig[key];
        }

    }
    /**
     * set an option
     * @param {string} key
     * @param {string} value
     */
    setOption(key, value) {
        this._options[key] = value;
    }

    /**
     * reposition the Option List
     * used for global scroll event
     */
    repositionOptionsUL() {
        if (this.isOpen) {
            const rect = this._dropdown.getBoundingClientRect();
            const styles = {

                position: 'fixed',
                display: 'block',
                left: rect.left + 'px',
                top: rect.bottom + 'px',
                width: rect.width + 'px'
            };
            Object.assign(this._optionsUL.style, styles);

            //If the dropdown is too far to the bottom of the screen, open it to the top
            if (this._optionsUL.getBoundingClientRect().bottom > window.innerHeight) {
                const rectUL = this._optionsUL.getBoundingClientRect();
                this._optionsUL.style.top = (rect.top - rectUL.height) + "px";
                this._optionsUL.classList.add(tmdc.optListTop);
            } else {
                this._optionsUL.classList.remove(tmdc.optListTop);
            }
        }
    }

    /**
     * Open the dropdown. 
     * the onOpen callback wont get called if the dropdown is empty!
     * @param {number} scrollPosition (optional) - scroll list to position
     */
    open(scrollPosition = undefined) {
        if (this.isEmpty ||  __callCallback.call(this,"Open") === false) {
            return;
        }

        this._dropdown.classList.add(tmdc.open);
        document.body.appendChild(this._optionsUL);
        this.repositionOptionsUL();

        if (scrollPosition) {
            this._optionsUL.scrollTop = scrollPosition;
        } else if (this._lastScrollPosition) {
            this._optionsUL.scrollTop = this._lastScrollPosition;
        } else {
            //scroll to selected element
            const selectedElement = this._optionsUL.getElementsByClassName(tmdc.selected)[0];

            if (selectedElement) {
                this._optionsUL.scrollTop = selectedElement.offsetTop - (this._optionsUL.offsetHeight / 2);
            }
    }
    }

    /**
     * Close the dropdown.
     * The onClose callback wont get called, if the Dropdown is already closed!
     */
    close() {
        if (!this.isOpen ||  __callCallback.call(this,"Close") === false) {
            return;
        }

        //if select is multiple, store last opening position.
        //if select is single, the next open() will calculate the position to the selected element
        this.isMultiple && (this._lastScrollPosition = this._optionsUL.scrollTop);

        this._dropdown.classList.remove(tmdc.open, tmdc.openTop);
        this._dropdown.appendChild(this._optionsUL);
        this._optionsUL.style.cssText = '';
    }

    /**
     * Focus the dropdown
     */
    focus() {
        this._current.focus();
    }

    /**
     * Open or close the dropdown, depending on current state
     * This method wont trigger callbacks itsself, but calls for open or close and
     * triggers those callbacks
     */
    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    /**
     * Refresh content in the dropdown
     */
    refresh() {
        this._optionsUL.parentNode.removeChild(this._optionsUL);
        this._dropdown.parentNode.removeChild(this._dropdown);
        this._dropdown = __buildDropdown(this);//this._buildDropdown();
        this._domElement.parentNode.insertBefore(this._dropdown, this._domElement.nextSibling);

         __callCallback.call(this,"Refresh");
        return this;
    }

    /**
     * Remove TmDropdown from DOM and show the select element
     */
    destroy() {
        if ( __callCallback.call(this,"Destroy") === false) {
            return;
        }
        this._dropdown.parentNode.removeChild(this._dropdown);
        this._domElement.style.visibility = "";
        this._domElement.style.position = "";
        tmDropdownDelegator.remove(this);
        this.observer.disconnect();
        delete this._domElement.TmDropdown;
    }

    /**
     * Select a value and refresh the dropdown
     * Will dispatch a change Event
     * 
     * @param {string|HTMLOptionElement} valueOrOption
     * @param {boolean} refresh - shall the dropdown content be refreshed?
     */
    select(valueOrOption, refresh = true) {

        const vop = valueOrOption;
        if ( __callCallback.call(this,"OptionSelected", vop) === false) {
            return;
        }

        const sel = this._domElement;
        if (typeof vop === "object" && sel.contains(vop)) {
            if (sel.multiple) {
                vop.selected = !vop.selected;
            } else {
                vop.selected = true;
            }
        } else {
            this._domElement.value = vop;
        }

        refresh && this.refresh();

        const changeEvent = new Event('change', {bubbles: true});
        this._domElement.dispatchEvent(changeEvent);
        return this;
    }

    

}
//assign TmDropdown to window to make it global
window.TmDropdown = TmDropdown;
