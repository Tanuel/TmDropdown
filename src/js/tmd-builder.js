/* global __map,tmdc*/

/**
 * Builds the dropdown DOM element
 * 
 * @param {TmDropdown} tmd - TmDropdown instance to build the dropdown for
 * @returns {Element}
 * HTML div element with dropdown content
 * @internal
 */
const __buildDropdown = function (tmd) {
    const select = tmd._domElement;
    const wrapper = __create("div");
    const current = tmd._current = __buildCurrent(tmd, select);
    const ul = tmd._optionsUL = __buildOptionsList(tmd, select);

    wrapper.className = tmdc.wrapper + ' ' + tmd.getOption("wrapperClass");
    tmd.isMultiple && wrapper.classList.add(tmdc.multi);
    //If the select doesnt have any options, set auto width
    wrapper.style.width = select.children.length ? tmd.getOption("width") : 'auto';
    wrapper.appendChild(current);
    wrapper.appendChild(ul);
    __bindDropdownEvents(tmd,wrapper, ul);
    return wrapper;
};

/**
 * Build the tmDropdown-current element from the select
 * @param {TmDropdown} tmd - TmDropdown instance to build the dropdown for
 * @param {HTMLSelectElement} select
 * @returns {HTMLDivElement}
 */
const __buildCurrent = function (tmd, select) {
    const current = __create("a", {
        className: tmdc.current,
        tabIndex: tmd._domElement.tabIndex
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
                element.addEventListener("click", __selectByKeyDown.bind(this));
                current.appendChild(element);
            }, tmd);
        } else {
            current.textContent = select.options.length ? tmd.getOption("placeholder") : tmd.getOption("emptyText");
        }
    } else {
        //if the select doesnt have any options, set placeholder text
        if (select.selectedIndex !== -1) {
            current.textContent = select.options[select.selectedIndex].textContent;
        } else {
            current.textContent = select.options.length ? tmd.getOption("placeholder") : tmd.getOption("emptyText");
        }
    }

    current.addEventListener("click", tmd.toggle.bind(tmd));
    return current;
};

/**
 * Build the options list
 * @param {TmDropdown} tmd - TmDropdown instance to build the dropdown for
 * @param {HTMLSelectElement} select
 * @returns {HTMLUlElement}
 */
const __buildOptionsList = function (tmd, select) {
    const ul = __create("ul", {className: tmdc.optList});

    const children = select.children;
    __map.call(children, function (child) {
        if (child.tagName === 'OPTION') {
            ul.appendChild(__buildOption(tmd, child));
        } else if (child.tagName === 'OPTGROUP') {
            ul.appendChild(__buildOptgroup(tmd, child));
        }
    });

    ul.addEventListener("click", __selectByKeyDown.bind(tmd), true);
    //ul.addEventListener("scroll",function(event){event.stopPropagation();});
    return ul;
};

/**
 * Create a list element for an option
 * @param {TmDropdown} tmd - TmDropdown instance to build the dropdown for
 * @param {Element|option} option
 * A HTML Option Element
 * @returns {Element|TmDropdown._buildOption.li}
 * @internal
 */
const __buildOption = function (tmd, option) {
    const selected = option.selected && ' ' + tmdc.selected || '',
            disabled = option.disabled && ' ' + tmdc.disabled || '',
            hovered = option === tmd._lastSelectedOption && ' ' + tmdc.hover || '',
            li = __create("li", {
                option: option,
                textContent: option.textContent,
                className: tmdc.option + selected + disabled + hovered
            });
    return li;
};

/**
 * will create a list element for an optgroup
 * iterates through children to find options
 * This method will call __buildOption to generate the option list elements
 * 
 * @param {TmDropdown} tmd - TmDropdown instance to build the dropdown for
 * @param {HTMLOptgroupElement} optgroup
 * a html optgroup element
 * @returns {TmDropdown._buildOptgroup.li|Element}
 * @internal
 */
const __buildOptgroup = function (tmd, optgroup) {
    const options = optgroup.children,
            li = __create("li", {className: tmdc.optGroup}),
            label = __create("div", {
                className: tmdc.optGroupLabel,
                textContent: optgroup.label
            }),
            ul = __create("ul", {className: tmdc.optGroupList});

    __map.call(options, function (option) {
        ul.append(__buildOption(tmd, option));
    });

    li.append(label);
    li.append(ul);

    return li;
};


/*---- dropdown utility events ----*/
/**
 * @param {TmDropdown} tmd - Instance of TmDropdown
 * @param {HTMLDivElement} wrapper - the wrapper for the dropdown
 * @param {HTMLUlElement} optList - the wrapper for options
 * @returns {HTMLDivElement|wrapper}
 */
const __bindDropdownEvents = function (tmd,wrapper, optList) {
    wrapper.addEventListener('keydown', __onKeydown.bind(tmd));
    wrapper.addEventListener('focusin', __onFocusin.bind(tmd));
    wrapper.addEventListener('focusout', __onFocusout.bind(tmd));
    optList.addEventListener('mouseover', __listMouseover.bind(tmd));
    optList.addEventListener('mouseout', __listMouseout.bind(tmd));
    optList.addEventListener('mousedown', __listMousedown.bind(tmd));
    return wrapper;
};

const __onFocusin = function () {
    this._dropdown.classList.add(tmdc.focused);
    //this.open();
};

const __onFocusout = function () {
    if (!this._listClicked) {
        this._dropdown.classList.remove(tmdc.focused);
        this.close();
    }
    this._listClicked = false;
};

const __onKeydown = function (event) {
    const key = event.keyCode || event.which;
    switch (key) {

        case 38: //arrow up
            __navigate.call(this,event, "up");
            break;
        case 40: //arrow down
            __navigate.call(this,event, "down");
            break;
        case 32: //spacebar
        case 13: //enter
            this.isOpen ? __selectByKeyDown.call(this) : this.open();
            break;
        case 27://escape
            this.close();
            break;
    }
};
const __navigate = function (event, direction) {
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
            
            if(this.isMultiple){
                this._optionsUL.scrollTop = newHover.offsetTop - (this._optionsUL.offsetHeight / 2);
            }else{
                !newHover.option.disabled && __selectByNavigation.call(this,newHover.option);
            }
            
            
        }
        
    }
};

/**
 * Event handler for when the user clicks a 
 * @param {Event|Click} event - Click Event object
 */
const __selectByClickEvent = function (event) {
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
};

const __selectByKeyDown = function () {
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
};

const __selectByNavigation = function(option){
    this.select(option);
    this.focus();
    this.open();
};

const __listMousedown = function () {
    this._listClicked = true;
};

const __listMouseover = function (event) {
    const tcl = event.target.classList;
    __map.call(this._optionsUL.getElementsByClassName(tmdc.hover), function (li) {
        li.classList.remove(tmdc.hover);
    });
    if (tcl.contains(tmdc.option)) {
        tcl.add(tmdc.hover);
    }
};

const __listMouseout = function (event) {
    event.target.classList.remove(tmdc.hover);
};