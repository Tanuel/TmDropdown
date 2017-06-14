/*! TmDropdown v0.3.2
 *(C) Daniel Schuster 2017
 */
;(function (window,document) {
/** ----- TmDropdown default configuration ----- 
 * default configuration/options for TmDropdown
 */
var TmDropdownConfig = {
    /** A fixed width for the wrapper. You can use any valid CSS-Value here, such as 100%, 130px or auto (auto is not recommended). **/
    width:undefined,
    /**additional class for the wrapper element (still contains tmDropdown-wrapper)*/
    wrapperClass: '',
    /**A text to display if the select is empty / doesnt have any options<*/
    emptyText: "No options available"
}

window.TmDropdownConfig = TmDropdownConfig;
/** ----- TmDropdown main class ----- 
 * Available options:
 * width - width of the wrapper
 * wrapperClass - additional class for the tmDropdown-wrapper element
 * @type TmDropdown
 */
class TmDropdown {

    constructor(domElement, options = undefined) {
        if (domElement.nodeName.toUpperCase() !== 'SELECT') {
            throw "Element is not a Select";
        }
        this._domElement = domElement;
        if (typeof options === 'object') {
            this._options = Object.assign({},TmDropdownConfig,options);
        } else {
            this._options = {};
        }
        //this._width = this._domElement.offsetWidth+"px";
        this._dropdown = this._buildDropdown();
        this._domElement.style.visibility = "hidden";
        this._domElement.style.position = "absolute";
        this._domElement.parentNode.insertBefore(this._dropdown, this._domElement.nextSibling);
        this._domElement.TmDropdown = this;

        //add global event listeners for automatic close
        document.documentElement.addEventListener("mousedown", this._closeByGlobalEvent.bind(this));
        document.documentElement.addEventListener("touchstart", this._closeByGlobalEvent.bind(this));
        window.addEventListener("blur", this.close.bind(this))
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
                return this._options[key] || TmDropdownConfig[key];
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
     * Event handler for global mousedown or touchstart event to close
     * dropdown when something else is clicked
     * 
     * @param {Object|Event} event
     */
    _closeByGlobalEvent(event) {
        if (this._dropdown !== event.target && !this._dropdown.contains(event.target)) {
            this.close();
        }
    }

    /**
     * Open the dropdown
     */
    open() {
        this._dropdown.classList.add("tmDropdown-open");
        let selectedElement = this._dropdown.getElementsByClassName("tmDropdown-active")[0];
        if (selectedElement) {
            this._optionsUL.scrollTop = selectedElement.offsetTop - (this._optionsUL.offsetHeight / 2);
        }
        //If the dropdown is too far to the bottom of the screen, open it to the top
        if(this._optionsUL.getBoundingClientRect().bottom > window.innerHeight){
             this._dropdown.classList.add("tmDropdown-open-top");
        }else{
            this._dropdown.classList.remove("tmDropdown-open-top");
        }

    }
    /**
     * Close the dropdown
     */
    close() {
        this._dropdown.classList.remove("tmDropdown-open","tmDropdown-open-top");
    }

    /**
     * Open or close the dropdown, depending on current state
     */
    toggle() {
        if (this._dropdown.classList.contains("tmDropdown-open")) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Refresh content in the dropdown
     */
    refresh() {
        this._dropdown.parentNode.removeChild(this._dropdown);
        this._dropdown = this._buildDropdown();
        this._domElement.parentNode.insertBefore(this._dropdown, this._domElement.nextSibling);
    }

    /**
     * Remove TmDropdown from DOM and show the select element
     */
    destroy() {
        this._dropdown.parentNode.removeChild(this._dropdown);
        this._domElement.style.visibility = "";
        this._domElement.style.position = "";
        delete this._domElement.TmDropdown;
    }

    /**
     * Select a value and refresh the dropdown
     * Will dispatch a change Event
     * 
     * @param {string} value
     */
    select(value) {
        this._domElement.value = value;
        this.refresh();
        var changeEvent = new Event('change', {bubbles: true});
        this._domElement.dispatchEvent(changeEvent);
    }

    /**
     * Builds the dropdown DOM element
     * 
     * @returns {Element}
     * HTML div element with dropdown content
     * @internal
     */
    _buildDropdown() {
        let select = this._domElement;
        var wrapper = document.createElement("div");
        wrapper.className = 'tmDropdown-wrapper ' + this.getOption("wrapperClass");
        wrapper.style.width = this.getOption("width");

        var current = document.createElement("div");
        current.className = 'tmDropdown-current';
        //if the select doesnt have any options, set different text
        if (select.selectedIndex !== -1) {
            current.innerText = select.options[select.selectedIndex].innerText;
        } else {
            current.innerText = this.getOption("emptyText");
            wrapper.style.width = "auto";
        }
        current.addEventListener("click", this.toggle.bind(this));

        var ul = this._optionsUL = document.createElement("ul");
        ul.className = 'tmDropdown-ul';

        var children = this._domElement.children;
        for (var i = 0; i < children.length; i++) {
            let c = children[i];
            if (c.tagName === 'OPTION') {
                ul.appendChild(this._buildOption(c));
            } else if (c.tagName === 'OPTGROUP') {
                ul.appendChild(this._buildOptgroup(c));
            }
        }

        wrapper.appendChild(current);
        wrapper.appendChild(ul);
        return wrapper;
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
        var li = document.createElement("li");
        li.innerText = option.innerText;
        var selected = option.selected ? ' tmDropdown-active' : '';
        var disabled = option.disabled ? ' tmDropdown-disabled' : '';
        li.className = 'tmDropdown-li' + selected + disabled;
        li.dataset.value = option.value;
        let _this = this;
        if (!option.disabled) {
            li.addEventListener("click", function () {
                _this.select(this.dataset.value);
                _this.close();
            });
        }
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
        var options = optgroup.children;
        var li = document.createElement("li");
        li.className = "tmDropdown-optgroup";
        var label = document.createElement("div");
        label.className = "tmDropdown-optgroup-label";
        label.innerText = optgroup.label;
        var ul = document.createElement("ul");
        ul.className = "tmDropdown-optgroup-options";

        for (var i = 0; i < options.length; i++) {
            ul.append(this._buildOption(options[i]));
        }
        li.append(label);
        li.append(ul);
        return li;
    }
}
//assign TmDropdown to window to make it global
window.TmDropdown = TmDropdown;
/* ----- JQUERY INTEGRATION ----- 
 * 
 * If jQuery is defined in the global scope,
 * it can be used to handle TmDropdown in an easy manner.
 * The jQuery plugin is lightweight and will call
 * the corresponding methods in the TmDropdown object
 * 
 * Initialization:
 * $(selector).TmDropdown(options);
 * you can provide an object with options
 * 
 * Actions:
 * $(selector).TmDropdown("refresh"); - refresh dropdown
 * $(selector).TmDropdown("open"); - open dropdown
 * $(selector).TmDropdown("close"); - close dropdown
 * $(selector).TmDropdown("toggle"); - open or close dropdown, depending on current state
 * $(selector).TmDropdown("destroy"); - destroy TmDropdown and show the select element
 * $(selector).TmDropdown("select",value); - select a value
 */
if (window.jQuery) {
    var jqTmDropdown = function (action = undefined,value = undefined) {
        if (typeof action === 'undefined' || typeof action === 'object') {
            return this.each(function () {
                if (this.TmDropdown instanceof TmDropdown) {
                    console.warn("TmDropdown already initialized on this element");
                    return;
                }
                new TmDropdown(this,action);

            });
        } else {
            switch (action) {
                case "refresh":
                    return this.each(function () {
                        if (this.TmDropdown instanceof TmDropdown) {
                            this.TmDropdown.refresh();
                        } else {
                            console.warn("TmDropdown not initialized on this element yet");
                        }
                    });
                    break;
                case "open":
                    return this.each(function () {
                        if (this.TmDropdown instanceof TmDropdown) {
                            this.TmDropdown.open();
                        } else {
                            console.warn("TmDropdown not initialized on this element yet");
                        }
                    });
                    break;
                case "close":
                    return this.each(function () {
                        if (this.TmDropdown instanceof TmDropdown) {
                            this.TmDropdown.close();
                        } else {
                            console.warn("TmDropdown not initialized on this element yet");
                        }
                    });
                    break;
                case "toggle":
                    return this.each(function () {
                        if (this.TmDropdown instanceof TmDropdown) {
                            this.TmDropdown.toggle();
                        } else {
                            console.warn("TmDropdown not initialized on this element yet");
                        }
                    });
                    break;
                case "destroy":
                    return this.each(function () {
                        if (this.TmDropdown instanceof TmDropdown) {
                            this.TmDropdown.destroy();
                        } else {
                            console.warn("TmDropdown not initialized on this element yet");
                        }
                    });
                    break;
                case "select":
                    if(value){
                        return this.each(function(){
                            if (this.TmDropdown instanceof TmDropdown) {
                                this.TmDropdown.select(value);
                            } else {
                                console.warn("TmDropdown not initialized on this element yet");
                            }
                        });
                    }
                default:
                    console.error("Invalid parameter " + action + " for TmDropdown");
            }
        }
    };
    //add TmDropdown to jquery
    window.jQuery.fn.TmDropdown = jqTmDropdown;
    
    //create alias for backwards compatibility
    window.jQuery.fn.tmDropdown = jqTmDropdown;
}
})(window,document);