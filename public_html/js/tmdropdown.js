;(function (window) {
class TmDropdown {

    constructor(domElement) {
        if (domElement.nodeName.toUpperCase() !== 'SELECT') {
            throw "Element is not a Select";
        }
        this._domElement = domElement;
        //this._width = this._domElement.offsetWidth+"px";
        this._dropdown = this._buildDropdown();

        this._domElement.style.visibility = "hidden";
        this._domElement.style.position = "absolute";
        this._domElement.parentNode.insertBefore(this._dropdown, this._domElement.nextSibling);
        this._domElement.TmDropdown = this;



        let _this = this;
        document.body.addEventListener("mouseup", function (e) {
            console.log(!_this._dropdown.contains(e.target));
            if (_this._dropdown !== e.target && !_this._dropdown.contains(e.target)) {
                _this.close();
            }
        });
    }
    /**
     * Open the dropdown
     */
    open() {
        this._dropdown.classList.add("tmDropdown-open");
    }
    /**
     * Close the dropdown
     */
    close() {
        this._dropdown.classList.remove("tmDropdown-open");
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
     * 
     * @returns {Element}
     * HTML div element with dropdown content
     * @internal
     */
    _buildDropdown() {
        let select = this._domElement;
        let _this = this;//for event handlers
        var wrapper = document.createElement("div");
        wrapper.className = 'tmDropdown-wrapper';
        //wrapper.style.width = select.offsetWidth+"px";
        wrapper.style.width = window.getComputedStyle(select).width;

        var current = document.createElement("div");
        current.className = 'tmDropdown-current';
        current.innerText = select.options[select.selectedIndex].innerText;
        current.addEventListener("click", this.toggle.bind(this));

        var arrow = document.createElement("div");
        arrow.className = "tmDropdown-arrow";
        arrow.addEventListener("click", this.toggle.bind(this));

        var ul = document.createElement("ul");
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

        wrapper.appendChild(arrow);
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
 * $(selector).TmDropdown();
 * 
 * Actions:
 * $(selector).TmDropdown("refresh"); - refresh dropdown
 * $(selector).TmDropdown("open"); - open dropdown
 * $(selector).TmDropdown("close"); - close dropdown
 * $(selector).TmDropdown("toggle"); - open or close dropdown, depending on current state
 * $(selector).TmDropdown("destroy"); - destroy TmDropdown and show the select element
 */
if (window.jQuery) {
    var jqTmDropdown = function (action = undefined) {
        if (typeof action === 'undefined' || typeof action === 'object') {
            if (typeof action !== 'undefined') {
                //TODO: Handle options
            }
            return this.each(function () {
                if (this.TmDropdown instanceof TmDropdown) {
                    console.warn("TmDropdown already initialized on this element");
                    return;
                }
                new TmDropdown(this);

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
})(window);