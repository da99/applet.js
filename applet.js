"use strict";
/* jshint undef: true, unused: true */
/* global Hogan, promise  */

var Applet = function () {
  var i = this; // === this instance

  i.funcs = [];

  i.data_cache = {};

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

    if (o.name === 'data' && o.data)
      instance.data_cache = _.extend(instance.data_cache, o.data);

    var i = 0, f;

    // if (o.name.indexOf('ajax') > -1)
    // log(instance)
    while (instance.funcs[i]) {
      f             = instance.funcs[i];
      o.this_config = instance.config_for_func(f);
      o.this_func   = f;
      o.data_cache  = instance.data_cache;

      f(o);
      ++i;
    }

    return instance;
  }; // === func

  Applet.prototype.new_func = function () {

    var arr = _.flatten(_.toArray(arguments));
    var i   = this;

    _.each(arr, function (f) {
      if (!_.isFunction(f))
        throw new Error('Error: Not a function');
      if (f({name : 'this position', applet: i}) === 'top')
        i.funcs.unshift(f);
      else
        i.funcs.push(f);
    });



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

    var selector    = 'script[type^="text/mustache"]:not(script.compiled)';
    var scripts     = (o.target || $('body')).find(selector).addBack(selector);
    if (scripts.length < 1)
      return;

    _.each(scripts, function (raw) {
      var t              = $(raw);
      var types          = t.attr('type').split('/');
      var html           = t.html();
      var placeholder_id = Applet.dom_id(t);
      var data_key       = types[2];
      var id             = Applet.dom_id(t, 'mustache_templates_' + (data_key || ''));
      var pos            = 'replace';

      t.addClass('compiled');

      switch (_.trim(types[1])) {
        case 'mustache-top':
          pos = 'top';
        break;

        case 'mustache-bottom':
          pos = 'bottom';
        break;
      } // === switch type[1]

      var meta = {
        id             : id,
        key            : data_key,
        html           : html,
        mustache       : Hogan.compile(html),
        placeholder_id : placeholder_id,
        elements       : null,
        pos            : pos
      };

      o.applet.new_func(
        function (o) {
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
        }
      ); // === new_func

    });

  }; // ==== funcs: template ==========


  // === show_if ====================
  Applet.funcs.show_if = function (o) {
    if (o.name !== 'dom') return;

    var selector   = '*[data-show_if]';
    var targets    = $(o.target || $('body')).find(selector).addBack(selector);

    _.each(targets, function (raw_node) {
      var node    = $(raw_node);
      var the_key = Applet.remove_attr(raw_node, 'data-show_if');

      if (!Applet.is_true(o.data_cache, the_key))
        node.hide();

      var the_id  = Applet.dom_id(node);

      o.applet.new_func(
        function (o) {
          if (o.name !== 'data') return;

          switch (Applet.is_true(o.data, the_key)) {
            case true:
              $('#' + the_id).show();
            return;

            case false:
              $('#' + the_id).hide();
            return;
          } // === switch value

        } // === func
      );

    }); // === each

  }; // === funcs: show_if ========

  // === hide_if ====================
  Applet.funcs.hide_if = function (o) {
    if (o.name !== 'dom') return;

    var selector   = '*[data-hide_if]';
    var targets    = $(o.target || $('body')).find(selector).addBack(selector);

    _.each(targets, function (raw_node) {
      var node = $(raw_node);
      var key  = Applet.remove_attr(node, 'data-hide_if');

      if (Applet.is_true(o.data_cache, key) === true)
        node.hide();

      var id  = Applet.dom_id(node);

      o.applet.new_func(
        function (o) {
          if (o.name !== 'data') return;

          switch (Applet.is_true(o.data, key)) {
            case true:
              $('#' + id).hide();
            return;
            case false:
              $('#' + id).show();
            return;
          } // === switch value
        }
      ); // === new_func

    }); // === each target

  }; // === funcs: hide_if ========


  // === ajax =====================
  Applet.funcs.ajax = function (o) {

    switch (o.name) {

      case 'ajax':
        if (o['send?']) {
          o.promise = promise.post(o.url, o.data, o.headers);
          o.promise.then(function (err, text, xhr) {
            o.applet.run({
              name: 'ajax response',
              raw_response: {err: err, text: text, xhr: xhr},
              request : {
                form_id : o.form_id,
                url     : o.url,
                data    : o.data,
                headers : o.headers
              },
              promise: o.promise
            });
          });
        }
      break;

      case 'ajax response':
        if (!o.response && o.raw_response) {
          var status     = o.raw_response.xhr && o.raw_response.xhr.status;
          var err        = o.raw_response.err;
          var err_tags   = [];
          if (err) {
            err_tags.push('server');
            err_tags.push(status);
          }

          o.response = {};

          var json;
          try {
            json = JSON.parse(o.raw_response.text);
          } catch(e) {
            err = true;
            if (_.isEmpty(err_tags))
              err_tags.push('invalid json');
          }

          if (err)
            o.response = {error: {tags: err_tags, msg: o.raw_response.text}};
          else
            o.response = json;
        }
      break;

    } // === switch o.name

  }; // === funcs: ajax


  // === form =====================
  Applet.funcs.form = function (o) {

    if (o.name === 'ajax response' && o.request) {
      $('#' + o.request.form_id ).prop('disabled', false);
      return;
    }

    if (o.name !== 'dom')
      return;

    var selector = $('form:not(form.compiled) button.submit');
    var target   = $(o.target || $('body')).find(selector).addBack(selector);

    if (!o.this_func.submit) {
      o.this_func.submit = function (a) {
        return function (e) {
          var form = $(this).closest('form');
          form.prop('disabled', true);
          e.preventDefault();
          e.stopPropagation();
          a.run({
            name    : 'ajax',
            'send?' : true,
            form_id : form.attr('id'),
            url     : form.attr('action'),
            headers : {"Accept": "application/json"},
            data    : form.serializeJSON()
          });
        };
      };
    } // === if this_func

    var i = 0;
    while (target[i]) {
      $(target[i]).on('click', o.this_func.submit(o.applet));
      ++i;
    } // === while
  }; // === funcs: form

})(); // === end scope =================================








