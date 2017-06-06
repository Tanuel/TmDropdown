/* Native Javascript usage
 * Note that this Library is for use of modern browsers
 * and requires the browser to have implemented the
 * EcmaScript6 standard
 */
document.addEventListener("DOMContentLoaded", function () {
    
    //--- Initialization---
    //Get Elements
    document.querySelectorAll(".tmDropdownNative")
        .forEach(function (element) {
            //init the plugin
            new TmDropdown(element);
        });
});




/* jQuery usage
 * This is a leightweight plugin and only helps accessing the funcionality
 * of TmDropdown, meaning it still requires modern browsers with
 * EcmaScript6 implementation of classes
 */
//Wait for document to be ready
$(document).ready(function () {
    //init the plugin
    $("select.tmDropdownJquery").tmDropdown();

});