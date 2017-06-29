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

        this._dropdown = this._buildDropdown();
        Object.assign(domElement.style, {
            visibility: "hidden",
            position: "absolute"
        });
        domElement.parentNode.insertBefore(this._dropdown, domElement.nextSibling);
        domElement.TmDropdown = this;

        tmDropdownDelegator.add(this);

        if (this.getOption("observe")) {
            let obs = new MutationObserver(this._sourceMutated.bind(this));
            var config = {
                attributes: true,
                childList: true,
                characterData: true,
                subtree:true
            };
            obs.observe(domElement, config);
            this._observer = obs;
        }

        this._callCallback("Rendered");
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
     * Wrapper function for callbacks. Checks if the callback is a function and 
     * then calls it
     * @param {string} name
     * Name of callback (without on, like "Open" or "Rendered")
     * @param {mixed} param
     * a secondary parameter to be passed to the callback
     * @returns {mixed}
     * returns the return value of the callback
     */
    _callCallback(name, param = undefined) {
        const onFn = this.getOption("on" + name);
        (typeof onFn === 'function') && onFn.call(this._domElement, this, param);
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
        if (this.isEmpty || this._callCallback("Open") === false) {
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
        if (!this.isOpen || this._callCallback("Close") === false) {
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
        this._dropdown = this._buildDropdown();
        this._domElement.parentNode.insertBefore(this._dropdown, this._domElement.nextSibling);

        this._callCallback("Refresh");
        return this;
    }

    /**
     * Remove TmDropdown from DOM and show the select element
     */
    destroy() {
        if (this._callCallback("Destroy") === false) {
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
        if (this._callCallback("OptionSelected", vop) === false) {
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

    /**
     * Builds the dropdown DOM element
     * 
     * @returns {Element}
     * HTML div element with dropdown content
     * @internal
     */
    _buildDropdown() {
        const select = this._domElement;
        const wrapper = __create("div");
        const current = this._current = this._buildCurrent(select);
        const ul = this._optionsUL = this._buildOptionsList(select);

        wrapper.className = tmdc.wrapper + ' ' + this.getOption("wrapperClass");
        this.isMultiple && wrapper.classList.add(tmdc.multi);
        //If the select doesnt have any options, set auto width
        wrapper.style.width = select.children.length ? this.getOption("width") : 'auto';
        wrapper.appendChild(current);
        wrapper.appendChild(ul);
        this._bindDropdownEvents(wrapper, ul);
        return wrapper;
    }

    /**
     * Build the tmDropdown-current element from the select
     * @param {HTMLSelectElement} select
     * @returns {HTMLDivElement}
     */
    _buildCurrent(select) {
        const current = __create("a", {
            className: tmdc.current,
            tabIndex: this._domElement.tabIndex
        });
        //current.className = tmdc.current;
        //current.tabIndex = this._domElement.tabIndex;
        if (select.multiple) {
            if (select.selectedOptions.length !== 0) {
                __map.call(select.selectedOptions, function (option) {
                    const element = __create("div", {
                        option: option,
                        textContent: option.textContent,
                        className: tmdc.currentItem
                    });
                    element.addEventListener("click", this._selectByClickEvent.bind(this));
                    current.appendChild(element);
                }, this);
            } else {
                current.textContent = select.options.length ? this.getOption("placeholder") : this.getOption("emptyText");
            }
        } else {
            //if the select doesnt have any options, set placeholder text
            if (select.selectedIndex !== -1) {
                current.textContent = select.options[select.selectedIndex].textContent;
            } else {
                current.textContent = select.options.length ? this.getOption("placeholder") : this.getOption("emptyText");
            }
        }

        current.addEventListener("click", this.toggle.bind(this));
        return current;
    }

    /**
     * Build the options list
     * @param {HTMLSelectElement} select
     * @returns {HTMLUlElement}
     */
    _buildOptionsList(select) {
        const ul = __create("ul", {className: tmdc.optList});

        const children = select.children;
        __map.call(children, function (child) {
            if (child.tagName === 'OPTION') {
                ul.appendChild(this._buildOption(child));
            } else if (child.tagName === 'OPTGROUP') {
                ul.appendChild(this._buildOptgroup(child));
            }
        }, this);

        ul.addEventListener("click", this._selectByClickEvent.bind(this), true);
        //ul.addEventListener("scroll",function(event){event.stopPropagation();});
        return ul;
    }

    /**
     * Create a list element for an option
     * 
     * @param {Element|option} option
     * A HTML Option Element
     * @returns {Element|TmDropdown._buildOption.li}
     * @internal
     */
    _buildOption(option) {
        const selected = option.selected && ' ' + tmdc.selected || '',
                disabled = option.disabled && ' ' + tmdc.disabled || '',
                hovered = option === this._lastSelectedOption && ' ' + tmdc.hover || '',
                li = __create("li", {
                    option: option,
                    textContent: option.textContent,
                    className: tmdc.option + selected + disabled + hovered
                });
        return li;
    }

    /**
     * will create a list element for an optgroup
     * iterates through children to find options
     * This method will call _buildOption to generate the option list elements
     * 
     * @param {type} optgroup
     * a html optgroup element
     * @returns {TmDropdown._buildOptgroup.li|Element}
     * @internal
     */
    _buildOptgroup(optgroup) {
        const options = optgroup.children,
                li = __create("li", {className: tmdc.optGroup}),
                label = __create("div", {
                    className: tmdc.optGroupLabel,
                    textContent: optgroup.label
                }),
                ul = __create("ul", {className: tmdc.optGroupList});

        __map.call(options, function (option) {
            ul.append(this._buildOption(option));
        }, this);

        li.append(label);
        li.append(ul);

        return li;
    }

    /*---- dropdown utility events ----*/
    /**
     * 
     * @param {HTMLDivElement} wrapper - the wrapper for the dropdown
     * @param {HTMLUlElement} optList - the wrapper for options
     * @returns {HTMLDivElement|wrapper}
     */
    _bindDropdownEvents(wrapper, optList) {
        wrapper.addEventListener('keydown', this._onKeydown.bind(this));
        wrapper.addEventListener('focusin', this._onFocusin.bind(this));
        wrapper.addEventListener('focusout', this._onFocusout.bind(this));
        optList.addEventListener('mouseover', this._listMouseover.bind(this));
        optList.addEventListener('mouseout', this._listMouseout.bind(this));
        optList.addEventListener('mousedown', this._listMousedown.bind(this));
        return wrapper;
    }

    _onFocusin() {
        this._dropdown.classList.add(tmdc.focused);
        //this.open();
    }

    _onFocusout() {
        if (!this._listClicked) {
            this._dropdown.classList.remove(tmdc.focused);
            this.close();
        }
        this._listClicked = false;
    }

    _onKeydown(event) {
        const key = event.keyCode || event.which;
        switch (key) {

            case 38: //arrow up
                this._navigate(event, "up");
                break;
            case 40: //arrow down
                this._navigate(event, "down");
                break;
            case 32: //spacebar
            case 13: //enter
                this.isOpen ? this._selectByKeyDown() : this.open();
                break;
            case 27://escape
                this.close();
                break;
        }
    }
    _navigate(event, direction) {
        event.preventDefault();
        if (!this.isOpen) {
            this.open();
            return;
        }
        const child = direction === 'up' ? "lastChild" : "firstChild";
        const sibling = direction === 'up' ? "previousElementSibling" : "nextElementSibling";
        const optlist = this._optionsUL;
        //currently hovered element
        const hovered = this.hoveredElement;
        let newHover;
        if (!hovered) {
            newHover = optlist.firstChild.classList.contains(tmdc.option) ? optlist.firstChild : optlist.firstChild.firstChild;
            newHover.classList.add(tmdc.hover);
        } else {
            newHover = hovered[sibling];
            if (!newHover && hovered.parentElement.parentElement.classList.contains(tmdc.optGroup)) {
                newHover = hovered.parentElement.parentElement[sibling];
            }
            if (newHover) {
                while (newHover && newHover.classList.contains(tmdc.optGroup) && !newHover.children[1][child]) {
                    newHover = newHover[sibling];
                }
                if (newHover.classList.contains(tmdc.optGroup)) {
                    newHover = newHover.children[1][child];
                }
            }
            if (newHover) {
                hovered.classList.remove(tmdc.hover);
                newHover.classList.add(tmdc.hover);
            }
            this._optionsUL.scrollTop = newHover.offsetTop - (this._optionsUL.offsetHeight / 2);
        }
    }

    /**
     * Event handler for when the user clicks a 
     * @param {Event|Click} event - Click Event object
     */
    _selectByClickEvent(event) {
        //get option assigned to element in _buildOption()
        const li = event.target;
        const option = li.option;
        if (!option.disabled) {

            li.classList.toggle(tmdc.selected);
            let oldScroll = this._optionsUL.scrollTop;
            this.select(option);
            this.isMultiple && this.open(oldScroll);// = oldScroll;
            this.focus();
        }
    }

    _selectByKeyDown() {
        const hovered = this.hoveredElement;
        if (!hovered) {
            return;
        }
        const option = hovered.option;
        if (!option.disabled) {
            hovered.classList.toggle(tmdc.selected);
            let oldScroll = this._optionsUL.scrollTop;
            this._lastSelectedOption = option;
            this.select(option);
            this.isMultiple && this.open(oldScroll);// = oldScroll;
            this.focus();
        }
    }

    _listMousedown() {
        this._listClicked = true;
    }

    _listMouseover(event) {
        const tcl = event.target.classList;
        __map.call(this._optionsUL.getElementsByClassName(tmdc.hover), function (li) {
            li.classList.remove(tmdc.hover);
        });
        if (tcl.contains(tmdc.option)) {
            tcl.add(tmdc.hover);
        }
    }

    _listMouseout(event) {
        event.target.classList.remove(tmdc.hover);
    }

    _sourceMutated() {
        this.refresh();
    }

}
//assign TmDropdown to window to make it global
window.TmDropdown = TmDropdown;
