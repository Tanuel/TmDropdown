/*! TmDropdown v0.4.1
 *(C) Daniel Schuster 2017
 *https://tanuel.github.io/TmDropdown/ */
;(function (window,document) {
	"use strict;"
/** ----- TmDropdown default configuration ----- 
 * default configuration/options for TmDropdown
 */
var TmDropdownConfig = {
    /**Indicates if the Dropdown should get closed when the document gets scrolled.
     * If false, the dropdown will move with the document, but can cause performance issues*/
    closeOnScroll: true,
    /**A text to display if the select is empty / doesnt have any options<*/
    emptyText: "No options available",
    /** A fixed width for the wrapper. You can use any valid CSS-Value here,
     * such as 100%, 130px or auto (auto is not recommended). **/
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
        //close when somewhere else is clicked or tapped
        document.documentElement.addEventListener("mousedown", this._closeByGlobalEvent.bind(this));
        document.documentElement.addEventListener("touchstart", this._closeByGlobalEvent.bind(this));
        //close when the window is left
        window.addEventListener("blur", this.close.bind(this));
        if(this.getOption("closeOnScroll")){
            window.addEventListener("scroll",this._closeByGlobalEvent.bind(this),true);
        }else{
            window.addEventListener("scroll",this._repositionByGlobalEvent.bind(this),true);
        }
        
        //call the onRendered callback
        this._callCallback("Rendered");
    }
    
    /**
     * indicates wether the dropdown is currently opened or not
     * @type boolean
     */
    get isOpen(){
        if(this._dropdown.classList.contains("tmDropdown-open")){
            return true;
        }else{
            return false;
        }
    }
    
    /**
     * indicates if the dropdown contains any options
     * @type boolean
     */
    get isEmpty(){
        if(this._domElement.children.length === 0){
            return true;
        }else{
            return false;
        }
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
    _callCallback(name,param = undefined){
        if(typeof this.getOption("on"+name) === 'function'){
            let callback = this.getOption("on"+name).bind(this._domElement,this,param)
            return callback();
        }
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
            && this._optionsUL !== event.target&& !this._optionsUL.contains(event.target)) {
            this.close();
        }
    }


    _repositionByGlobalEvent(ev){
        if(this._optionsUL !== ev.target && !this._optionsUL.contains(ev.target)){
            this.repositionOptionsUL();
        }
    }
    repositionOptionsUL(){
        if(this.isOpen){
            let rect = this._dropdown.getBoundingClientRect();
            let cssString = "position:fixed;display:block;left:"+rect.left+"px;top:"+rect.bottom+"px;width:"+rect.width+"px";
            document.body.appendChild(this._optionsUL);
            this._optionsUL.style.cssText = cssString;

            //If the dropdown is too far to the bottom of the screen, open it to the top
            if(this._optionsUL.getBoundingClientRect().bottom > window.innerHeight){
                let rectUL = this._optionsUL.getBoundingClientRect();
                this._optionsUL.style.top = (rect.top - rectUL.height)+"px";
                this._optionsUL.classList.add("tmDropdown-ul-top");
            }else{
                this._optionsUL.classList.remove("tmDropdown-ul-top");
            }
        }
    }

    /**
     * Open the dropdown. 
     * the onOpen callback wont get called if the dropdown is empty!
     */
    open() {
        if(this.isEmpty){
            return;
        }
        if(this._callCallback("Open") === false){
            return;
        }
        this._dropdown.classList.add("tmDropdown-open");
        this.repositionOptionsUL();
        
        //scroll to selected element
        let selectedElement = this._optionsUL.getElementsByClassName("tmDropdown-active")[0];
        if (selectedElement) {
            this._optionsUL.scrollTop = selectedElement.offsetTop - (this._optionsUL.offsetHeight / 2);
        }
    }
    /**
     * Close the dropdown.
     * The onClose callback wont get called, if the Dropdown is already closed!
     */
    close() {
        if(!this.isOpen){
            return;
        }
        if(this._callCallback("Close") === false){
            return;
        }
        this._dropdown.classList.remove("tmDropdown-open","tmDropdown-open-top");
        this._dropdown.appendChild(this._optionsUL);
        this._optionsUL.style.cssText = '';
    }

    /**
     * Open or close the dropdown, depending on current state
     * This method wont trigger callbacks itsself, but calls for open or close and
     * triggers those callbacks
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
        this._optionsUL.parentNode.removeChild(this._optionsUL);
        this._dropdown.parentNode.removeChild(this._dropdown);
        this._dropdown = this._buildDropdown();
        this._domElement.parentNode.insertBefore(this._dropdown, this._domElement.nextSibling);
        
        this._callCallback("Refresh");
    }

    /**
     * Remove TmDropdown from DOM and show the select element
     */
    destroy() {
        if(this._callCallback("Destroy")  === false){
            return
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
     * @param {string} value
     */
    select(value) {
        if(this._callCallback("OptionSelected",value) === false){
            return
        }
        this._domElement.value = value;
        this.refresh();
        var changeEvent = new Event('change', {bubbles: true});
        this._domElement.dispatchEvent(changeEvent);
    }
    
    _selectByClickEvent(ev){
        let el = ev.target;
        if (typeof el.dataset.value !== 'undefined') {
                this.select(el.dataset.value);
                this.close();
        }
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
            current.textContent = select.options[select.selectedIndex].textContent;
        } else {
            current.textContent = this.getOption("emptyText");
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
        
        ul.addEventListener("click",this._selectByClickEvent.bind(this),true);

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
        li.textContent = option.textContent;
        var selected = option.selected ? ' tmDropdown-active' : '';
        var disabled = option.disabled ? ' tmDropdown-disabled' : '';
        li.className = 'tmDropdown-li' + selected + disabled;
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
        var options = optgroup.children;
        var li = document.createElement("li");
        li.className = "tmDropdown-optgroup";
        var label = document.createElement("div");
        label.className = "tmDropdown-optgroup-label";
        label.textContent = optgroup.label;
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