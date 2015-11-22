
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


The Essence of Applet.js
============

  1) You create a group of functions and pass them to the initialize:
  `new Applet( func, [func, func], another_func )`
  2) You call `.run(string_action, my_value)` on Applet.js.
  3) Each function receives the arguments you passed to `.run`.
  4) The order of the functions is the same as the order you gave to
  `new Applet( ... )`

That's it. It's that simple and stupid.

Applet.js also provides pre-existing functions like `show_if` and
`hide_if`, among others. See the [source code](https://github.com/da99/applet.js/blob/master/applet.js)
because it will take some time to finish the documentation (i.e. this README file).

Here is an example of using Applet.js:

```javascript
  var my_app = new Applet(
    _.values(Applet.funcs), // === default functions that come w/Applet.js.
    my_func,                // === accepts a function.
    my_array_of_funcs       // === accepts an Array of functions.
  );

  // === Get some data,
  //     maybe from the result of an AJAX call
  var my_payload = {"name": "Bob Wiley", "movie": "What About Bob?"};
  my_app.run("my new data", my_payload);

  my_app.run("my array", [1,2,3]);

  my_app.run("whatever", "I'm single. Let's go out.");

```

Pre-written functions:
======================

These can be found in `Applet.funcs`:

```javascript
   Applet.funcs = {
      show_if: function (name, val) {...},
      hide_if: function (name, val) {...},
   };
```

"show\_if"
----------

In your HTML, add `data-` attributes:

```html
  <div id="loading" data-hide_if="page_loaded?">
    Loading...
  </div>

  <div class="hidden block" data-show_if="logged_in?">
    <p>You are logged in.</p>
  </div>
```



