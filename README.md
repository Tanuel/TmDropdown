# TmDropdown

*Leightweight* JavaScript Library/Plugin for costum select dropdowns. 
Also provides *optional* jQuery integration.

[**Read the documentation here!**](https://tanuel.github.io/TmDropdown)

Include **CSS** and **JS** on your website:

    <link rel="stylesheet" href="css/TmDropdown.css">
    <!--optional: include jQuery before TmDropdown.js to make use of the jQuery-Plugin-->
    <script src="js/TmDropdown.js"></script>

Create a HTML-Select

    <select class="tmDropdown">
        <option>option 1</option>
        <option>option 2</option>
        <option disabled>option 3 (disabled)</option>
    </select>

Init TmDropdown:

    //Native Javascript:
    document.addEventListener("DOMContentLoaded", function () {
        //--- Initialization---
        //Get Elements
        document.querySelectorAll(".tmDropdownNative")
            .forEach(function (element) {
                //init the plugin
                new TmDropdown(element);
            });
    });
    
    //jQuery
    $(document).ready(function () {
        //init the plugin
        $("select.tmDropdown").tmDropdown();
    });

This Plugin also supports *Optgroups* like this:

    <select class="tmDropdown">
        <option>Option ohne Gruppe</option>
        <optgroup label="Gruppe 1">
            <option>Option 1</option>
            <option>Option 2</option>
        </optgroup>
        <optgroup label="Gruppe 2">
            <option>Option 3</option>
            <option>Option 4</option>
        </optgroup>
    </select>

