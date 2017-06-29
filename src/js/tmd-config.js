/** ----- TmDropdown default configuration ----- 
 * default configuration/options for TmDropdown
 */
var TmDropdownConfig = {
    /**Indicates if the Dropdown should get closed when the document gets scrolled.
     * If false, the dropdown will move with the document, but can cause performance issues*/
    closeOnScroll: true,
    /**A text to display if the select is empty / doesnt have any options<
     * @type String*/
    emptyText: "No options available",
    /**Register a MutationObserver to watch changes in the select
     * @type Boolean */
    observe:true,
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