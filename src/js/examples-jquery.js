/* jQuery usage
 * This is a leightweight plugin and only helps accessing the funcionality
 * of TmDropdown, meaning it still requires modern browsers with
 * EcmaScript6 implementation of classes
 */
//Wait for document to be ready
$(document).ready(function () {
    //init the plugin
    $("select.tmDropdownJquery").TmDropdown();
    var options = {
        width: "200px",
        wrapperClass: "green-border",
        emptyText: "No options here",
        onRendered: ()=> {console.log("TmDropdown rendered");},
        onClose: ()=> false,
        onOpen: ()=> console.log("TmDropdown opened"),
        onRefresh: function(tmd){console.log(tmd);console.log(this);}
    };
    $("select.tmDropdownJqOptions").TmDropdown(options);
});