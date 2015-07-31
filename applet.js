"use strict";
/* jshint undef: true, unused: true */
/* global Hogan  */

var Applet = function (optional_func) {
  var i = this; // === this instance

  i.funcs = [];

  if (optional_func)
    i.new_func(optional_func);

  i.run('constructor');
  i.run('dom');
  i.run('form');
}; // === Applet constructor ===========================

Applet.funcs = {};

(function () { // === scope ==============================

  // =====================================================
  // === HELPERS
  // =====================================================

  var bool, log;

  bool = function (o, key) {
    if (!_.has(o, key))
      throw new Error('Key not found: ' + key);

    return !!o[key];
  };

  log = Applet.log = function () {
    if (window.console)
      return console.log.apply(console, arguments);
    return this;
  };

  // Examples:
  //
  //   .new_id()           ->  Integer
  //   .new_id('prefix_')  ->  String
  //
  Applet.new_id = function (prefix) {
    if (!Applet.hasOwnProperty('_id'))
      Applet._id = -1;
    Applet._id = Applet._id + 1;
    return (prefix) ? prefix + Applet._id : Applet._id;
  }; // === func

  // Returns id.
  // Sets id of element if no id is set.
  //
  // .dom_id(raw_or_jquery)
  // .dom_id('prefix', raw_or_jquer)
  //
  Applet.dom_id = function () {
    var args = _.toArray(arguments);
    var o      = _.find(args, _.negate(_.isString));
    var prefix = _.find(args, _.isString);
    var old    = o.attr('id');

    if (old && !_.isEmpty(old))
      return old;

    var new_id = Applet.new_id(prefix || 'id_for_applet_') ;
    o.attr('id', new_id);
    return new_id;
  }; // === id

  Applet.insert_after = function (script) {
    $($(script).contents()).insertAfter($(script));
  }; // === insert_after

  Applet.insert_before = function (script) {
    $($(script).contents()).insertBefore($(script));
  }; // === insert_before

  Applet.FRONT_BANGS = /^\!+/;

  Applet.is_true = function (data, raw_key) {
    var key        = _.trim(raw_key);
    var bang_match = key.match(Applet.FRONT_BANGS);
    var dots       = ( bang_match ? key.replace(bang_match[0], '') : key ).split('.');
    var keys       = _.map( dots, _.trim );

    var current = data;
    var ans  = false;


    _.detect(keys, function (key) {
      if (_.has(current, key)) {
        current = data[key];
        ans = !!current;
      } else {
        ans = undefined;
      }

      return !ans;
    });

    if (ans === undefined)
      return ans;

    if (bang_match) {
      _.times(bang_match[0].length, function () {
        ans = !ans;
      });
    }

    return ans;
  }; // === func

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

  Applet.standard_name = function (str) {
    return _.trim(str).replace(/\ +/g, ' ').toLowerCase();
  };

  Applet.remove_attr = function (node, name) {
    var val = $(node).attr(name);
    $(node).removeAttr(name);
    return val;
  };

  Applet.node_array = function (unknown) {
    var arr = [];
    _.each($(unknown), function (dom) {
      if (dom.nodeType !== 1)
        return arr.push(dom);

      arr.push({
        tag    : dom.nodeName,
        attrs  : attrs(dom),
        custom : {},
        childs : Applet.node_array($(dom).contents())
      });
    });

    return arr;
  };

  Applet.raw_scripts = function () {
    return $('script[type="text/applet"]:not(script.compiled)');
  }; // === func

  Applet.each_raw_script = function (func) {

    var scripts, i, contents, script;

    while ((scripts = Applet.raw_scripts()).length > 0) {

      i = 0;

      while (scripts[i]) {
        script   = $(scripts[i]);
        contents = $(script.html());
        script.empty();
        script.append(contents);
        script.addClass('compiled');
        ++i;
      }


      i = 0;
      while (scripts[i]) {
        if (func)
          func(scripts[i], scripts);
        ++i;
      }
    }

    return true;
  }; // === func: each_raw_script

  Applet.top_descendents = function (dom, selector) {
    var arr = [];
    _.each($(dom), function (node) {
      var o = $(node);
      if (o.is(selector))
        return arr.push(o);
      arr = arr.concat(Applet.top_descendents(o.children(), selector));
    }); // === func

    return arr;
  }; // === func


  // =====================================================
  // === PROTOTYPE
  // =====================================================


  Applet.prototype.config_for_func = function (f) {
    var i = this;

    if (!i.func_ids) {
      i.func_id_to_config = {}; // === used by callbacks to store info.
      i.func_ids          = {}; // give each callback an id to be used in .configs
    }

    var id = _.findKey(i.func_ids, function (v) { return v === f; } );

    if (!id) {
      id                      = Applet.new_id('config_id_');
      i.func_id_to_config[id] = {};
      i.func_ids[id]          = f;
    }

    return i.func_id_to_config[id];
  }; // === config_id

  // === Examples:
  //
  // .run('str')               => {name: 'str'}
  // .run('str', {...})        => {name: 'str', data: {...}}
  // .run({name: 'str', ... }) => {name: 'str', ... }
  //
  Applet.prototype.run = function (msg, data) {

    var o = null;
    var instance = this;

    if (_.isPlainObject(msg)) {
      o = msg;
    } else { // === is String
      o = {
        name : Applet.standard_name(msg),
        data : data
      };
    }

    o.applet = instance;

    _.each(
      [
        'before before ' + o.name,
        'before ' + o.name,
        o.name,
        'after ' + o.name,
        'after after ' + o.name
      ],
      function (name) {
        o.name = Applet.standard_name(name);
        var i = 0, f;

        while (instance.funcs[i]) {
          f             = instance.funcs[i];
          o.this_config = instance.config_for_func(f);
          o.this_func   = f;

          f(o);
          ++i;
        }
      }
    ); // === _.each name

    return instance;
  }; // === func

  Applet.prototype.new_func = function (func) {
    var i   = this;

    if (_.isArray(func)) {
      _.each(func, function (f) { i.new_func(f); });
      return i;
    }

    var msg = {name : 'this position', applet: i};

    if (func(msg) === 'top')
      i.funcs.unshift(func);
    else
      i.funcs.push(func);

    return this;
  };


  // =====================================================
  // === CORE functions
  // =====================================================

  // === dom ==================================
  Applet.funcs.dom = function (o) {
    if (o.name === 'before dom') {
      if (!o.dom) {
        o.dom = Applet.raw_scripts();
        _.each(o.dom, function (raw) {
          var script   = $(raw);
          var contents = $(script.html());
          script.empty();
          script.append(contents);
          script.addClass('compiled');
        });
      }
    }

    if (o.name === 'after dom') {
      _.each(
        o.dom.filter('script'),
        function (e) {
          var s = $(e);
          (s.contents()).insertBefore(s);
        }
      );
    }

    if (o.name === 'after after dom') {
      if (Applet.raw_scripts().length > 0)
        o.applet.run('dom');
    }
  }; // === funcs: dom


  // === template ====================
  Applet.funcs.template = function (o) {
    var this_config = o.this_config;
    var applet      = o.applet;

    if (o.name === 'this position')
      return 'top';

    if (o.name === 'constructor') {
      o.this_config.templates = [];
      return;
    }

    if (o.name !== 'dom')
      return;

    var selector  = '*[template]';
    this_config.templates = this_config.templates.concat(
      _.map(
        Applet.top_descendents(o.dom, selector),
        function (t) {
          var placeholder    = $('<script type="text/applet_placeholder"></script>');
          var placeholder_id = Applet.dom_id(placeholder);

          var attr = _.trim(Applet.remove_attr(t, 'template')).split(/\ +/);
          var name = attr.shift();
          var pos  = (attr.length > 0) ? attr.pop() : 'replace';

          var meta = {
            name      : name,
            html      : t.prop('outerHTML'),
            mustache  : Hogan.compile(t.prop('outerHTML')),
            placeholder_id : placeholder_id,
            elements  : null,
            pos       : pos
          };

          applet.new_func(function (o) {
            if (o.name !== 'data' || !_.isPlainObject(o.data[meta.name]))
              return;

            // === Remove old nodes:
            if (meta.elements && meta.pos === 'replace') {
              meta.elements.remove();
            }

            var html = $(meta.mustache.render(o.data));
            if (meta.pos === 'replace' || meta.pos === 'bottom')
              html.insertBefore($('#' + meta.placeholder_id));
            else
              html.insertAfter($('#' + meta.placeholder_id));

            meta.elements = html;
            applet.run({
              name: 'dom',
              dom:  html
            });
          });

          t.replaceWith(placeholder);
          return meta;
        }
    ) // === each
    );
  }; // ==== funcs: template ==========


  // === show_if ====================
  Applet.funcs.show_if = function (o) {
    var this_config = o.this_config;

    if (o.name === 'constructor') {
      this_config.show_if_data_cache = {};
      return;
    }

    if (o.name === 'data') {
      _.extend(this_config.show_if_data_cache, o.data);
      return;
    }

    if (o.name !== 'dom')
      return;

    var selector = '*[show_if]';
    _.each(
      $(o.dom).find(selector).addBack(selector),
      function (raw) {
        var node = $(raw);
        var id   = Applet.dom_id(node);
        var val  = Applet.remove_attr(node, 'show_if');

        if (!Applet.is_true(this_config.show_if_data_cache, val))
          node.hide();

        o.applet.new_func(
          function (o) {
            if (o.name !== 'data')
              return;

            var data = o.data;
            var ans = Applet.is_true(data, val);
            if (ans === undefined)
              return;

            if ( ans )
              $('#' + id).show();
            else
              $('#' + id).hide();
          }
        ); // === push
      } // === function raw
    ); // === _.each
  }; // === funcs: show_if ========

  // === ajax =====================
  Applet.funcs.ajax = function (o) {

    switch (o.name) {

      case 'ajax':
        if (o['send?']) {
          o.promise = promise.post(o.url, o.data, o.headers);
        }
      break;

    } // === switch o.name

  }; // === funcs: ajax


  // === form =====================
  Applet.funcs.form = function (o) {

    if (o.name !== 'dom')
      return;

    _.each(
      (o.form_submits = $('form:not(form.compiled) button.submit')),
      function (raw) {
        $(raw).on('click', function (e) {
          var form = $(this).parent('form');
          e.preventDefault();
          e.stopPropagation();
          o.applet.run({
            name    : 'ajax',
            'send?' : true,
            form_id : form.attr('id'),
            url     : form.attr('action'),
            headers : {"Accept": "application/json"},
            data    : form.serializeJSON()
          });
        });
      }
    ); // === each
  }; // === funcs: form



})(); // === end scope =================================








