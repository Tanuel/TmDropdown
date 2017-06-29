/*! TmDropdown v0.6.1
 *(C)  2017
 *https://tanuel.github.io/TmDropdown/ */
;(function (window,document) {
	"use strict";
/** ----- TmDropdown default configuration ----- 
 * default configuration/options for TmDropdown
 */
var TmDropdownConfig = {
    /**Indicates if the Dropdown should get closed when the document gets scrolled.
     * If false, the dropdown will move with the document, but can cause performance issues*/
    closeOnScroll: true,
    /**A text to display if the select is empty / doesnt have any options<
     * @type String
     */
    emptyText: "No options available",
    /**Placeholder text, if no value is selected
     * @type String */
    placeholder: "Select an option",
    /** A fixed width for the wrapper. You can use any valid CSS-Value here,
     * such as 100%, 130px or auto (auto is not recommended).*/
    width: undefined,
    /**additional class for the wrapper element (still contains tmDropdown-wrapper)*/
    wrapperClass: '',
    /**Callback for when the TmDropdown close() method is called.
     * This gets called at the start of the method. If the callback returns
     * false, the method will abort and nothing happens.<br>
     * The callback gets passed a parameter with the instance of TmDropdown.<br>
     * The <i>this</i> variable in the function scope corresponds to the select element
     * @type function
     */
    onClose: undefined,
    /**Callback for when the TmDropdown destroy() method is called.
     * This gets called at the start of the method. If the callback returns
     * false, the method will abort and the dropdown will not get destroyed.<br>
     * The callback gets passed a parameter with the instance of TmDropdown.<br>
     * The <i>this</i> variable in the function scope corresponds to the select element
     * @type function
     */
    onDestroy: undefined,
    /**Callback for when the TmDropdown open() method is called.
     * This gets called at the start of the method. If the callback returns
     * false, the method will abort and nothing happens.<br>
     * The callback gets passed a parameter with the instance of TmDropdown.<br>
     * The <i>this</i> variable in the function scope corresponds to the select element
     * @type function
     */
    onOpen: undefined,
    /**Callback for when the TmDropdown select() method is called.
     * This gets called at the start of the method. If the callback returns
     * false, the method will abort and nothing happens. (Value doesnt get changed)<br>
     * The callback gets passed two parameters:<br>
     * first: instance of TmDropdown<br>
     * second: Selected value<br>
     * The <i>this</i> variable in the function scope corresponds to the select element
     * @type function
     */
    onOptionSelected:undefined,
    /**Callback method to call AFTER the TmDropdown refresh() method has finished
     * building the dropdown. Anything returned by the callback will be ignored.<br>
     * The callback gets passed a parameter with the instance of TmDropdown.<br>
     * The <i>this</i> variable in the function scope corresponds to the select element
     * @type function
     */
    onRefresh: undefined,
    /**Callback to call after the TmDropdown has initially finished building.<br>
     * This callback will only be called once at the end of the constructor method.<br>
     * The <i>this</i> variable in the function scope corresponds to the select element
     * @type function
     */
    onRendered: undefined
};

window.TmDropdownConfig = TmDropdownConfig;
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

        const addDocEvent = document.documentElement.addEventListener;
        addDocEvent("mousedown", this._closeByGlobalEvent.bind(this));
        addDocEvent("touchstart", this._closeByGlobalEvent.bind(this));

        window.addEventListener("blur", this.close.bind(this));

        const closeOrReposition = this.getOption("closeOnScroll") && this._closeByGlobalEvent || this._respositionByGlobalEvent;

        window.addEventListener("scroll", closeOrReposition.bind(this), true);

        this._callCallback("Rendered");
    }

    /**
     * indicates wether the dropdown is currently opened or not
     * @type boolean
     */
    get isOpen() {
        return this._dropdown.classList.contains("tmDropdown-open");
    }

    /**
     * indicates if the dropdown contains any options
     * @type boolean
     */
    get isEmpty() {
        return (this._domElement.children.length === 0);
    }
    
    get isMultiple(){
        return this._domElement.multiple;
    }
    /**
     * tells if anything in this dropdown is targeted by the specified event
     * @param {Event} event -  a native event
     * @returns {boolean}
     */
    isEventTarget(event){
        return  this._dropdown !== event.target &&
               !this._dropdown.contains(event.target) &&
                this._optionsUL !== event.target &&
               !this._optionsUL.contains(event.target);
    }
    
    isOptlistEventTarget(event){
        return this._optionsUL !== event.target &&
              !this._optionsUL.contains(event.target);
    }
    
    /**
     * returns the currently selected li (not the option!)
     * returns null for multiple select!
     * @type HTMLLiElement
     */
    get selectedElement(){
        return this.isMultiple ? null : this._optionsUL.getElementsByClassName('tmDropdown-selected')[0];
    }
    /**
     * returns the currently hovered li (not the option!)
     * @type HTMLLiElement
     */
    get hoveredElement(){
        let hovered = this._optionsUL.getElementsByClassName('tmDropdown-hover')[0];
        if(!hovered && !this.isMultiple){
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
        (typeof onFn === 'function') && onFn.bind(this._domElement, this, param)();
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
        if (this._dropdown !== event.target && !this._dropdown.contains(event.target)
                && this._optionsUL !== event.target && !this._optionsUL.contains(event.target)) {
            this.close();
        }
    }

    _repositionByGlobalEvent(ev) {
        if (this._optionsUL !== ev.target && !this._optionsUL.contains(ev.target)) {
            this.repositionOptionsUL();
        }
    }

    repositionOptionsUL() {
        if (this.isOpen) {
            const rect = this._dropdown.getBoundingClientRect();
            const cssString = [
                'position: fixed',
                'display: block',
                'left: ' + rect.left + 'px',
                'top: ' + rect.bottom + 'px',
                'width: ' + rect.width + 'px'
            ].join(";");


            this._optionsUL.style.cssText = cssString;

            //If the dropdown is too far to the bottom of the screen, open it to the top
            if (this._optionsUL.getBoundingClientRect().bottom > window.innerHeight) {
                const rectUL = this._optionsUL.getBoundingClientRect();
                this._optionsUL.style.top = (rect.top - rectUL.height) + "px";
                this._optionsUL.classList.add("tmDropdown-ul-top");
            } else {
                this._optionsUL.classList.remove("tmDropdown-ul-top");
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

        this._dropdown.classList.add("tmDropdown-open");
        document.body.appendChild(this._optionsUL);
        this.repositionOptionsUL();
        
        if(scrollPosition){
            this._optionsUL.scrollTop = scrollPosition;
        }else if(this._lastScrollPosition){
            this._optionsUL.scrollTop = this._lastScrollPosition;
        }else {
            //scroll to selected element
            const selectedElement = this._optionsUL.getElementsByClassName("tmDropdown-selected")[0];

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
        
        this._dropdown.classList.remove("tmDropdown-open", "tmDropdown-open-top");
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
        this._dropdown.classList.contains("tmDropdown-open") && this.close() || this.open();
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
        delete this._domElement.TmDropdown;
    }

    /**
     * Select a value and refresh the dropdown
     * Will dispatch a change Event
     * 
     * @param {string|HTMLOptionElement} valueOrOption
     * @param {boolean} refresh - shall the dropdown content be refreshed?
     */
    select(valueOrOption,refresh = true) {

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
        const wrapper = document.createElement("div");
        const current = this._current = this._buildCurrent(select);
        const ul = this._optionsUL = this._buildOptionsList(select);

        wrapper.className = 'tmDropdown-wrapper ' + this.getOption("wrapperClass");
        this.isMultiple && wrapper.classList.add('tmDropdown-multiple');
        //wrapper.className += this.isMultiple ? 'tmDropdown-multiple' : '';
        //If the select doesnt have any options, set auto width
        wrapper.style.width = select.children.length ? this.getOption("width") : 'auto';
        wrapper.appendChild(current);
        wrapper.appendChild(ul);
        this._bindDropdownEvents(wrapper,ul);
        return wrapper;
    }
    
    /**
     * Build the tmDropdown-current element from the select
     * @param {HTMLSelectElement} select
     * @returns {HTMLDivElement}
     */
    _buildCurrent(select) {
        const create = document.createElement.bind(document);
        const current = create("a");
        current.className = 'tmDropdown-current';
        current.tabIndex = this._domElement.tabIndex;
        if (select.multiple) {
            if(select.selectedOptions.length !== 0){
                Array.prototype.map.call(select.selectedOptions,function(option){
                    const element = create("div");
                    element.option = option;
                    element.textContent = option.textContent;
                    element.className = "tmDropdown-current-item";
                    element.addEventListener("click",this._selectByClickEvent.bind(this));
                    current.appendChild(element);
                },this);
            }else{
                current.textContent = select.options.length ? this.getOption("placeholder") : this.getOption("emptyText");
            }
        } else {
            //if the select doesnt have any options, set placeholder text
            if(select.selectedIndex !== -1){
                current.textContent = select.options[select.selectedIndex].textContent;
            }else{
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
        const ul = document.createElement("ul");
        ul.className = 'tmDropdown-ul';

        const children = select.children;
        Array.prototype.map.call( children, function(child){
            if (child.tagName === 'OPTION') {
                ul.appendChild(this._buildOption(child));
            } else if (child.tagName === 'OPTGROUP') {
                ul.appendChild(this._buildOptgroup(child));
            }
        },this);

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
        const li = document.createElement("li"),
              selected = option.selected && ' tmDropdown-selected' || '',
              disabled = option.disabled && ' tmDropdown-disabled' || '',
              hovered = option === this._lastSelectedOption && ' tmDropdown-hover' || '';
        li.option = option;
        li.textContent = option.textContent;
        li.className = 'tmDropdown-li' + selected + disabled + hovered;
        li.dataset.value = option.value;
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
        const create = document.createElement.bind(document),
                options = optgroup.children,
                li = create("li"),
                label = create("div"),
                ul = create("ul");

        li.className = "tmDropdown-optgroup";
        label.className = "tmDropdown-optgroup-label";
        label.textContent = optgroup.label;
        ul.className = "tmDropdown-optgroup-options";
        Array.prototype.map.call(options,function(option){
             ul.append(this._buildOption(option));
        },this);

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
    _bindDropdownEvents(wrapper,optList){
        wrapper.addEventListener('keydown',this._onKeydown.bind(this));
        wrapper.addEventListener('focusin',this._onFocusin.bind(this));
        wrapper.addEventListener('focusout',this._onFocusout.bind(this));
        optList.addEventListener('mouseover',this._listMouseover.bind(this));
        optList.addEventListener('mouseout',this._listMouseout.bind(this));
        optList.addEventListener('mousedown',this._listMousedown.bind(this));
        return wrapper;
    }
    
    _onFocusin(){
        this._dropdown.classList.add('tmDropdown-focused');
        //this.open();
    }
    
    _onFocusout(){
        if(!this._listClicked){
            this._dropdown.classList.remove('tmDropdown-focused');
            this.close();
        }
        this._listClicked = false;
    }
    
    _onKeydown(event){
        const key = event.keyCode || event.which;
        switch(key){
            //arrow up
            case 38: this._navigate(event,"up");break;
            //arrow down
            case 40: this._navigate(event,"down");break;
            //enter
            case 13: this.isOpen ? this._selectByEnter() : this.open(); break;
            //escape
            case 27: this.close();break;
        }
    }
    _navigate(event,direction){
        event.preventDefault();
        if(!this.isOpen){
            this.open();
            return;
        }
        const child = direction === 'up' ? "lastChild" : "firstChild";
        const sibling = direction === 'up' ? "previousElementSibling" : "nextElementSibling";
        const optlist = this._optionsUL;
        //currently hovered element
        const hovered = this.hoveredElement;
        let newHover;
        if(!hovered){
            newHover = optlist.firstChild.classList.contains('tmDropdown-li') ? optlist.firstChild : optlist.firstChild.firstChild;
            newHover.classList.add('tmDropdown-hover');
        }else{
            newHover = hovered[sibling];
            if(!newHover && hovered.parentElement.parentElement.classList.contains('tmDropdown-optgroup')){
                    newHover = hovered.parentElement.parentElement[sibling];
            }
            if(newHover){
                while(newHover && newHover.classList.contains('tmDropdown-optgroup') && !newHover.children[1][child]){
                    newHover = newHover[sibling];
                }
                if(newHover.classList.contains('tmDropdown-optgroup')){
                    newHover = newHover.children[1][child];
                }
            }
            if(newHover){
                hovered.classList.remove('tmDropdown-hover');
                newHover.classList.add('tmDropdown-hover');
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
            
            li.classList.toggle("tmDropdown-selected");
            let oldScroll = this._optionsUL.scrollTop;
            this.select(option);
            this.isMultiple && this.open(oldScroll);// = oldScroll;
            this.focus();
        }
    }
    
    _selectByEnter(){
        const hovered = this.hoveredElement;
        if(!hovered){
            return;
        }
        const option = hovered.option;
        if (!option.disabled) {            
            hovered.classList.toggle("tmDropdown-selected");
            let oldScroll = this._optionsUL.scrollTop;
            this._lastSelectedOption = option;
            this.select(option);
            this.isMultiple && this.open(oldScroll);// = oldScroll;
            this.focus();
        }
    }
    
    _listMousedown(){
        this._listClicked = true;
    }
    
    _listMouseover(event){
        const tcl = event.target.classList;
        Array.prototype.map.call(this._optionsUL.getElementsByClassName('tmDropdown-hover'),function(li){
            li.classList.remove('tmDropdown-hover');
        });
        if(tcl.contains('tmDropdown-li')){
            tcl.add('tmDropdown-hover');
        }
    }
    
    _listMouseout(event){
       event.target.classList.remove('tmDropdown-hover');
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
                try{
                    new TmDropdown(this,action);
                }catch(error){
                    console.warn("Element "+this+" is not a Select element and will be skipped!");
                }

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
                case "reposition":
                    return this.each(function () {
                        if (this.TmDropdown instanceof TmDropdown) {
                            this.TmDropdown.repositionOptionsUL();
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