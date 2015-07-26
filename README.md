
da99's applet.js
===================

Inspired by [Mustache](https://mustache.github.io/) (i.e. logic-less templates) and [RiotJS](https://muut.com/riotjs/).


Install
=======

```bash
  bower install da99/applet.js
```

Instructions
=============

Not coming any time soon.

Example:
=======================================

```html
  <html>
    <body>

      <script type="text/applet">
        <div show_if="logged_in?">Logged in</div>
        <div show_if="!logged_in?">Hello, stranger.</div>
      </script>

      <script type="text/applet">
        <div show_if="happy?">I am happy.</div>
        <div show_if="sad?">I am SAD SAD SAD.</div>
      </script>

      <script src="../bower_components/jquery/dist/jquery.min.js"></script>
      <script src="../bower_components/applet.js/applet.js"></script>

      <script>
        $(function () {
          Applet.run(function (script, all) {
            ... process script ...
            $($(script).html()).insertBefore($(script));
          });

          // ========================================
        });
      </script>

    </body>
  </html
```
