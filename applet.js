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
    var attrs = {};
    var custom = custom_attrs();

    _.each(dom.attributes, function (o) {
      if (!_.contains(custom, o.name))
        attrs[o.name] = o.value;
    });

    return attrs;
  };

  var custom_attrs = Applet.custom_attrs = function (dom) {
    var attrs = [];

    _.each(Applet.stack, function (o) {
      if (o.name === 'attr')
        attrs.push(o.value);
    });

    if (!dom)
      return attrs;

    var custom = {};
    _.each(dom.attributes, function (o) {
      if (_.contains(attrs, o.name))
        custom[o.name] = o.value;
    });

    return custom;
  };

  var node_array = Applet.node_array = function (unknown) {
    var arr = [];
    _.each($(unknown), function (dom) {
      if (dom.nodeType !== 1)
        return arr.push({is_node: false, dom: dom });

      arr.push({
        tag    : dom.nodeName,
        attrs  : attrs(dom),
        custom : custom_attrs(dom),
        childs : node_array($(dom).contents())
      });
    });

    return arr;
  };

  var run = Applet.run = function (raw_data, func) {

    // === .run(func{})
    if (_.isFunction(raw_data) && !func) {
      func = raw_data;
      raw_data = null;
    }

    if (func && !raw_data) {
      var attr = func({name: 'attr'});
      if (attr)
        Applet.stack.push({name: 'attr', value: attr});
      Applet.stack.push({name: 'func', value: func});
      return Applet;
    }

    // === .run('prepend', func {})
    if (raw_data === "prepend" &&  _.isFunction(func))
      return Applet.stack.unshift(func);

    // === .run('name');
    // === .run('name', {});
    if (_.isString(raw_data) && (!func || _.isPlainObject(func))) {
      var o = {
        name: 'before ' + raw_data,
        data: func
      };

      _.detect(['before ', '', 'after '], function (prefix) {
        o.name = prefix + raw_data;
        return _.detect(Applet.stack, function (meta) {
          if (meta.name !== 'func')
            return false;

          var f = meta.value;
          var name = o.name;
          f(o);

          // === Stop running functions
          //     if names are different.
          return o.name !== name;
        });
      });

      return;
    } // === .run('name', {});

    if (!_.isPlainObject(raw_data))
      throw new Error("Unknown arguments.");

    var data = {};

    _.each(raw_data, function (v, k) {
      data[k] = v;
      if (!_.startsWith(k, '!') && !_.has(raw_data, '!' + k))
        data['!'+k] = !v;
    });

    _.each(Applet.stack, function (f) {
      if (f.name !== 'func')
        return;
      f.value({name: 'data', data: data});
    });

  }; // === run


  // ================= THE CORE =========================

  // === insert node
  run(
    function (e) {
      if (e.name !== 'after node')
        return;

      if (e.$.parent().length === 0)
        e.script.after(e.$);
    }
  ); // === insert node



  // === compile
  run(
    function (e) {

      if (e.name !== 'compile scripts')
        return;

      var list = $('script[type="text/applet"]:not(script.compiled)');
      if (list.length < 1)
        return;

      var attr_names = _.compact(
        _.map(
          Applet.stacks.all,
          function (f) { return f.name === 'attr' && f.value; }
        )
      );

      _.each(list, function (raw_script) {
        var contents = _.map($(raw_script).contents(), function (raw_node) {

          if (raw_node.nodeType !== 1)
            return raw_node;


          var o = {
            list : [],
            pos  : 0
          };

          return o.list[o.pos];
        });

        _.map();
        contents.each(function (n) {
          if (n.nodeType === 1) {
          }
        });

          var script    = $(raw_script);
          var script_id = Applet.id(raw_script);

          _.each($(script.html()), function (raw) {
            var dom    = $(raw);
            var attrs  = _.reduce(
              attr_names,
              function (o, name) {
                o[name] = dom.attr(name);
                dom.removeAttr(name);
                return o;
              },
              {}
            );

            var meta = {
              name       : 'new node',
              attrs      : attrs,
              script     : script,
              raw_script : raw_script,
              raw        : raw,
              $          : dom,
              used_funcs : []
            };

            Applet.run(meta);

          }); // === _.each script html find any with attrs

          script.addClass('compiled');
      }); // === each script applet

      Applet.run(e);
    }
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
    'prepend',
    function (e) {
      switch (e.name) {
        case 'attr':
          return 'render';

        case 'raw node':
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








