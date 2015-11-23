
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

  1) You create a group of functions:
    `new Applet( func, [func, func], another_func )`

  2) You call `.run(string_action, my_value)` on Applet.js.

  3) Each function receives the arguments you passed to `.run`.

  4) The order of the functions is the same as the order you gave to
  `new Applet( ... )`

Applet.js also provides pre-existing functions like `show_if` and
`hide_if`, among others. See the [source code](https://github.com/da99/applet.js/blob/master/applet.js)
because it will take some time to finish the documentation (i.e. this README file).

Here is an example of using Applet.js:

```javascript
  var My_App = function () {

    var my_app = new Applet(
      _.values(Applet.funcs), // === Optional: functions that come w/Applet.js.
      "dom",                  // === You can also pass Strings here.
      my_func,                // === accepts a function.
      my_array_of_funcs       // === accepts an Array of functions.
    );

    my_app.run(
      "my init",
      {"name": "Bob Wiley", "movie": "What About Bob?"}
    );

    my_app.run("my action", [1,2,3]);
    my_app.run("whatever", "I'm single. Let's go out.");

    return my_app;
  };

```

Pre-written functions:
======================

These can be found in `Applet.funcs`:

```javascript
   Applet.funcs = {
      show_if: function (name, val) {...},
      hide_if: function (name, val) {...},
      ...
   };
```

"show\_if"
----------

In your HTML, add `data-` attributes:

```html
  <div id="loading" data-show_if="my_val?">
    Loading...
  </div>
```

In your script:
```
  var my_app = new Applet( Applet.funcs.show_if );
   my_app.run("dom",  {"my_val?": false});
   my_app.run("data", {"my_val?": true});
```

"hide\_if"
----------

In your HTML, add `data-` attributes:

```html
  <div id="loading" data-hide_if="my_val?">
    Loading...
  </div>
```

In your script:
```
  var my_app = new Applet( Applet.funcs.hide_if );

  my_app.run("dom",  {"my_val?": true});
  my_app.run("data", {"my_val?": false});
```

"form"
------

HTML:
```HTML
  <form id="my_id" action="....">
     stuff...
     <button class="submit">Tally ho!</button>
  </form>
```

Javascript:
```javascript

  var my_response = function (meta) {
    if (!(meta.name == 'ajax response' && meta.request.form_id != "my_id"))
      return;

    // Do more processing based on meta.request or meta.response.
  };

  var my_app = new Applet(
      Applet.funcs.ajax,
      Applet.funcs.form,
      my_response
  );

  my_app.run("dom");
```

"template"
----------

Your HTML:
```HTML
  <script type="text/mustache/my_name">
     &lt;p&gt;  My mustache val: &quot;{{my_val}}&quot;. &gt;p&lt;
  </script>
  <script type="text/mustache-top/my_name"> &lt;p&gt;  My content. &gt;p&lt; </script>
```

For `type` attribute:
  * "text/**mustache**/my\_name"        : Template will be always be replaced.
  * "text/**mustache-top**/my\_name"    : Template will be always re-generated and placed at top.
  * "text/**mustache-bottom**/my\_name" : Template will be always be re-generated and placed at bottom.

Your Javascript:
```javascript
  var my_app = new Applet(Applet.funcs.template);
  my_app.run("dom");
  my_app.run("data", {my_name : {my_val : "Howdy, neighbor." } });
```

Applet Helpers
==============

"new\_id"
-------
```javascript
  Applet.new_id() // -> 0
  Applet.new_id() // -> 1
  Applet.new_id('my_ele_') // -> "my_ele_2"
  Applet.new_id('my_ele_') // -> "my_ele_3"
```

"dom\_id"
---------

Returns string to be used as an `id=` attribute.
Sets id of element if no id is set. Uses `Applet.new_id`
to help generate the id.

```javascript
  Applet.dom_id( jquery_or_html_ele )           // -> "id_for_applet_0";
  Applet.dom_id( 'prefix', jquery_or_html_ele ) // -> "prefix1";
```

"find"
-------------------

```javascript
  Applet.find("show_if", '*[data-show_if]');
  Applet.find("show_if", '*[data-show_if]', $('.my_target'));
```

"mark\_as\_compiled"
-------------------

```javascript
  Applet.mark_as_compiled("show_if", jquery_or_html_ele);
```

Element won't show up in results using [`.find`](https://github.com/da99/applet.js#find).


