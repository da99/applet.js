"use strict";

var Applet = {
  stack : [],
  links : [],
  _id : -1
};

(function () { // === scope ==============================

  var bool = function (o, key) {
    if (!_.has(o, key))
      throw new Error('Key not found: ' + key);

    return !!o[key];
  };

  var log = function (str) {
    if (window.console)
      return console.log.apply(console, arguments);
    return this;
  };

  // Get id or (create id, return it)
  var id = Applet.id = function (raw, prefix) {
    var o = $(raw);
    var old = o.attr('id');

    if (old && !_.isEmpty(old))
      return old;

    Applet._id = Applet._id + 1;
    var new_id = (prefix || 'id_for_applet') + '_' + Applet._id.toString();
    o.attr('id', new_id);
    return new_id;
  }; // === id

  var attrs = Applet.attrs = function (dom) {
    return _.reduce(
      dom.attributes,
      function (kv, o) {
        kv[o.name] = o.value;
        return kv;
      },
      {}
    );
  }; // === attrs

  var node_array = Applet.node_array = function (unknown) {
    var arr = [];
    _.each($(unknown), function (dom) {
      if (dom.nodeType !== 1)
        return arr.push(dom);

      arr.push({
        tag    : dom.nodeName,
        attrs  : attrs(dom),
        custom : {},
        childs : node_array($(dom).contents())
      });
    });

    return arr;
  };

  var run = Applet.run = function () {

    var msg, func, standard_name;
    var args = _.toArray(arguments);

    // === .run( 'name' )
    if (_.isString(args[0]) && args.length === 1) {
      msg = {name: args[0], data: {}};
    } else

    // === .run( 'name', {} )
    if ( _.isString(args[0]) && _.isPlainObject(args[1]) && args.length === 2 ) {
      msg = {name: args[0], data: args[1]};
    } else

    // === .run( {...} )
    if (_.isPlainObject(args[0]) && args.length === 1) {
      msg = {name: 'data', data: args[0]};
    } else

    // === .run( func )
    if (_.isFunction(args[0]) && args.length === 1) {
      msg = {name: 'new func', data: args[0]};
    } else {
      log(args);
      throw new Error("Unknown args");
    }

    // === Standardize data:
    if (_.isPlainObject(msg.data))
      msg.data = _.clone(msg.data);

    // === Standardize name of message:
    standard_name = _.words(_.trim(msg.name).toLowerCase()).join(' ');

    if (msg.name === 'new func') {
      Applet.links.push({name: 'func', from: Applet, to: msg.data });
    }


    // === Run message:
    _.detect(['before before ', 'before ', '', 'after ', 'after after '], function (prefix) {
      msg.name = prefix + standard_name;
      return _.detect(Applet.links, function (link) {
        if (link.name !== 'func')
          return false;

        var original_name = msg.name;
        link.to(msg);

        // === Stop running functions
        //     if names are different.
        return msg.name !== original_name;
      });
    });

  }; // === func: run


  // ================= THE CORE =========================

  // === insert node
  run(
    function (e) {
      if (e.name !== 'render scripts')
        return;

      _.each(e.data, function (raw_script) {
        var script = $(raw_script);
        id(script);
        (script.contents()).insertBefore();
        script.addClass('compiled');
      });
    }
  ); // === insert node



  // === compile
  run(
    function (e) {

      if (e.name !== 'compile scripts')
        return;

      var scripts = $('script[type="text/applet"]:not(script.compiled)');
      if (scripts.length < 1)
        return;

      Applet.run({
        name       : 'render scripts',
        dat        : scripts
      });

      script.addClass('compiled');

      Applet.run(e);
    } // === function
  ); // == run compile

  // === show_if
  run(
    function (e) {

      switch (e.name) {

        case 'attr':
          return 'show_if';

        case 'node':
          e.$.hide();

          // === Register the node:
          Applet.stacks.attrs.show_if.push({
            id: Applet.id(e.$),
            show_if: e.attrs.show_if
          });

          return;

        default: // === show time
          if (true)
            return;
          _.each(Applet.stacks.attrs.show_if, function (o) {
            if (!_.has(e, o.show_if))
              return;

            if (e[o.show_if])
              $('#' + o.id).show();
            else
              $('#' + o.id).hide();
          });
          return;

      } // === switch e.name

    }
  ); // === run show_if

  // === render
  run(
    function (e) {
      switch (e.name) {
        case 'attr':
          return 'render';

        case 'before raw node':
          e.is_raw = false;
          Applet.log(e);
        break;
      } // === switch e.name
    }
  ); // === render

  var THE_CORE = _.clone(Applet.stack);
  var reset = Applet.reset = function () {
    while (Applet.stack.length > 0) { Applet.stack.shift(); }

    _.each(THE_CORE, function (o) { Applet.stack.push(o); });
    return Applet;
  }; // === reset

})(); // === end scope =================================








