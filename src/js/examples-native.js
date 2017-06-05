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



