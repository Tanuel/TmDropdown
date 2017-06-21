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