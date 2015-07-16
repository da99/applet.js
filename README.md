
da99's applet.js
===================

Inspired by [Mustache]() (i.e. logic-less templates) and [RiotJS](https://muut.com/riotjs/).


Install
=======

```bash
  bower install da99/applet.js
```

Try to see where I am going with this:
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
          Applet.run({name: "compile scripts");

          // === Run each of these in your JS console,
          // ===    one by one:
          Applet.run({"logged_in?" : false);
          Applet.run({"logged_in?" : true);

          Applet.run({"happy?" : true);
          Applet.run({"happy?" : false);

          Applet.run({"sad?" : true);
          Applet.run({"sad?" : false);
          // ========================================
        });
      </script>

    </body>
  </html
```
