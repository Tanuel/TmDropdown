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