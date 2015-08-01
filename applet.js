"use strict";
/* jshint undef: true, unused: true */
/* global Hogan, promise  */

var Applet = function () {
  var i = this; // === this instance

  i.funcs = [];

  i.new_func(_.flatten(_.toArray(arguments)));

  i.run('constructor');
  i.run('dom');
}; // === Applet constructor ===========================

(function () { // === scope ==============================

  // =====================================================
  // === HELPERS
  // =====================================================

  var log;

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


  Applet.is_true = function (data, raw_key) {
    if (!Applet.FRONT_BANGS)
      Applet.FRONT_BANGS = /^\!+/;

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

  Applet.attrs = function (dom) {
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
        attrs  : Applet.attrs(dom),
        custom : {},
        childs : Applet.node_array($(dom).contents())
      });
    });

    return arr;
  };

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

    o.name = Applet.standard_name(o.name);
    var i = 0, f;

    while (instance.funcs[i]) {
      f             = instance.funcs[i];
      o.this_config = instance.config_for_func(f);
      o.this_func   = f;

      f(o);
      ++i;
    }

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
  // === FUNCTIONS
  // =====================================================

  Applet.funcs = {};

  // === template ====================
  Applet.funcs.template = function (o) {
    if (o.name === 'this position')
      return 'top';

    if (o.name !== 'dom')
      return;

    var selector    = 'script[type^="text/mustache"].not(script.compiled)';
    var scripts     = Applet.top_descendents((o.target || $('body')), selector);

    if (scripts.length > 0)
      return;

    var i = 0, t, data_key, placeholder_id, id, pos, meta, types;

    if (!o.this_func.render) {
      o.this_func.render = function (o) {
        var meta = this;
        if (o.name !== 'data' || !_.isPlainObject(o.data[meta.key]))
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
        o.applet.run({
          name   : 'dom',
          target : html
        });
      };
    } // === if render

    while (scripts[i]) {
      t = scripts[i];
      ++i;

      placeholder_id = Applet.dom_id(t);
      data_key       = types[2];
      id             = Applet.dom_id(t, 'mustache_templates_' + (data_key || ''));

      switch (_.trim(types[1])) {

        case 'mustache-top':
          pos = 'top';
          break;

        case 'mustache-bottom':
          pos = 'bottom';
          break;

        default:
          pos = 'replace';

      } // === switch type[1]

      meta = {
        id             : id,
        key            : data_key,
        html           : t.prop('outerHTML'),
        mustache       : Hogan.compile(t.prop('outerHTML')),
        placeholder_id : placeholder_id,
        elements       : null,
        pos            : pos
      };

      o.applet.new_func(o.this_func.render.bind(meta));

    } // === while

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

    var selector = '*[data-show_if]';
    var i=0, node, id, val;
    var target = $(o.target || $('body')).find(selector).addBack(selector);

    if (!o.this_func.show) {
      o.this_func.show = function (o) {
        if (o.name !== 'data')
          return;

        var val  = this;
        var data = o.data;
        var ans = Applet.is_true(data, val);
        if (ans === undefined)
          return;

        if ( ans )
          $('#' + id).show();
        else
          $('#' + id).hide();
      }; // === func
    } // === if show

    while (target[i]) {
      node = $(target[i]);
      id   = Applet.dom_id(node);
      val  = Applet.remove_attr(node, 'data-show_if');
      ++i;

      if (!Applet.is_true(this_config.show_if_data_cache, val))
        node.hide();

      o.applet.new_func(o.this_func.show.bind(val));

    } // === while

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

    var selector = $('form:not(form.compiled) button.submit');
    var target   = $(o.target || $('body')).find(selector).addBack(selector);

    if (!o.this_func.submit) {
      o.this_func.submit = function (e) {
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
      };
    } // === if this_func

    var i = 0;
    while (target[i]) {
      $(target[i]).on('click', o.this_func.submit);
      ++i;
    } // === while
  }; // === funcs: form



})(); // === end scope =================================








