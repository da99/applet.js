
da99's applet.js
===================

Inspired by:

  * [Mustache](https://mustache.github.io/) (i.e. logic-less templates)
  * [RiotJS](https://muut.com/riotjs/)
  * [Ractive](http://www.ractivejs.org/)


Install
=======

```bash
  bower install da99/applet.js
```

Please please please...
=============

Don't use this. Instead use:

  * [Ractive](http://www.ractivejs.org/)
  * [RiotJS](https://muut.com/riotjs/)
  * [ReactJS](http://facebook.github.io/react/)


Instructions
============

In your HTML, add `data-` attributes:

```html
  <div id="loading" data-hide_if="page_loaded?">
    Loading...
  </div>

  <div class="hidden block" data-show_if="logged_in?">
    <p>You are logged in.</p>
  </div>
```

In your script file:

```javascript
  var my_app = new Applet(
    _.values(Applet.funcs), // === default functions that come w/Applet.js.
    my_func,                // === accepts a function.
    my_array_of_funcs       // === accepts an Array of functions.
  );
```



