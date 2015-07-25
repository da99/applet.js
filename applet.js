"use strict";

var Applet = {
  stack : [],
  _id : -1
};

(function () { // === scope ==============================

  var bool = function (o, key) {
    if (!_.has(o, key))
      throw new Error('Key not found: ' + key);

    return !!o[key];
  };

  var log = Applet.log = function (str) {
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
      Applet.stack.push({name: 'func', data: msg.data });
    }

    msg.funcs = _.compact(_.map(Applet.stack, function (e) {
      return (e.name === 'func') && e.data;
    }));

    // === Run message:
    var f, i, original_name;
    _.detect(['before before ', 'before ', '', 'after ', 'after after '], function (prefix) {
      msg.name = prefix + standard_name;
      original_name = msg.name;

      var done = false;
      i = 0;
      while (msg.funcs[i]) {
        f = msg.funcs[i];
        i++;
        f(msg);

        // === Stop running functions
        //     if names are different.
        if (msg.name !== original_name) {
          i = msg.funcs.length;
          done = true;
        }
      }

      return done;
    });

  }; // === func: run


  // ================= THE CORE =========================

  // === compile
  run(
    function (e) {

      if (e.name !== 'before before compile scripts')
        return;

      var scripts = $('script[type="text/applet"]:not(script.compiled)');
      if (scripts.length < 1) {
        e.name = 'done';
        return;
      }

      e.data = scripts;
      _.each(scripts, function (raw_script) {
        var contents = $($(raw_script).text());
        var script   = $(raw_script);
        script.empty();
        script.addClass('compiled');
        script.append(contents);
      });

    } // === function
  ); // == run

  // === re-run "compile scripts" in case they are new SCRIPT tags
  run(
    function (e) {
      if (e.name !== 'after after compile scripts')
        return;

      _.each(e.data, function (raw) {
        ($(raw).contents()).insertBefore($(raw));
      });

      Applet.run('compile scripts');
    }
  ); // === run

  var THE_CORE = _.clone(Applet.stack);
  var reset = Applet.reset = function () {
    while (Applet.stack.length > 0) { Applet.stack.shift(); }
    _.each(THE_CORE, function (o) { Applet.stack.push(o); });
    return Applet;
  }; // === reset

})(); // === end scope =================================








