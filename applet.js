"use strict";

var Applet = null;

(function () { // === scope ==============================

  Applet = function () {
    var i = this; // === this instance

    i.stack = [];
    i.id_counter = -1;
    i.stack      = _.clone(Applet.core);

    i.configs    = {}; // === used by callbacks to store info.
    i.func_ids   = {}; // give each callback an id to be used in .configs

    i.run('constructor');
    i.run('dom');
    i.run('form');
  }; // === Applet constructor ===========================

  Applet._id = -1;

  // =====================================================
  // === HELPERS
  // =====================================================

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

  var insert_after = Applet.insert_after = function (script) {
    $($(script).contents()).insertAfter($(script));
  }; // === insert_after

  var insert_before = Applet.insert_before = function (script) {
    $($(script).contents()).insertBefore($(script));
  }; // === insert_before

  var meta_key = Applet.meta_key = function (str) {
    var dots  = str.split('.');
    var bangs = '';

    if (dots[0]) {
      var temp = /(\!+)?(.+)/.exec(dots[0]);
      if (temp) {
        bangs = temp[1] || '';
        dots[0] = temp[2];
      }
    }

    return { bangs: bangs, keys: dots};
  }; // === func

  var is_true = Applet.is_true = function (data, key) {
    var meta = meta_key(key);
    var current = data;
    var ans  = false;

    if (!_.has(data, meta.keys[0])) {
      return undefined;
    }

    _.detect(meta.keys, function (key) {
      if (_.has(current, key)) {
        current = data[key];
        ans = !!current;
      } else {
        ans = false;
      }

      return !ans;
    });

    if (meta.bangs) {
      _.times(meta.bangs.length, function (n) {
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

  var raw_scripts = Applet.raw_scripts = function () {
    return $('script[type="text/applet"]:not(script.compiled)');
  }; // === func

  var each_raw_script = Applet.each_raw_script = function (func) {

    var scripts, i, contents, script;

    while ((scripts = raw_scripts()).length > 0) {

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

  Applet.prototype.config_id = function (f) {
    var i = this;
    var id = _.findKey(i.func_ids, function (v) { return v === f; } );

    if (!id) {
      i.id_counter   = i.id_counter + 1;
      id             = 'config_id_' + i.id_counter;
      i.configs[id]  = {};
      i.func_ids[id] = f;
    }

    return id;
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

        while (instance.stack[i]) {
          f             = instance.stack[i];
          o.this_config = instance.configs[instance.config_id(f)];
          o.this_func   = f;

          f(o);
          ++i;
        }
      }
    ); // === _.each name

    return instance;
  }; // === func

  Applet.prototype.unshift = function (func) {
    this.stack.unshift(func);
    return this;
  };

  Applet.prototype.push = function (func) {
    this.stack.push(func);
    return this;
  };


  // =================== CORE =================
  Applet.core = [];


  var raw_scripts = function () {
    return $('script[type="text/applet"]:not(script.compiled)');
  }; // === func

  // === dom ==================================
  Applet.core.push(function (o) {
    if (o.name === 'before dom') {
      if (!o.dom) {
        o.dom = raw_scripts();
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
      if (raw_scripts().length > 0)
        o.applet.run('dom');
    }
  }); // === core: dom


  // === template ====================
  Applet.core.push(function (o) {
    var this_config = o.this_config;
    var applet     = o.applet;

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
          var placeholder = $('<script type="text/applet_placeholder"></script>');
          var placeholder_id = Applet.id(placeholder);
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

          applet.push(function (o) {
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
  }); // ==== core: template ==========


  // === show_if ====================
  Applet.core.push(function (o) {
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
        var id   = Applet.id(node);
        var val  = Applet.remove_attr(node, 'show_if');

        if (!Applet.is_true(this_config.show_if_data_cache, val))
          node.hide();

        o.applet.push(
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
  }); // === core: show_if ========

  Applet.core.push(
    function (o) {
      if (o.name !== 'before form')
        return;
      if (o.name === 'form') {
        if (!o['submit?'])
          return;
        o.send_ajax(o.data);
      }
      _.each(
        $('form:not(form.compiled) button.submit'),
        function (raw) {
          $(raw).on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            o.applet.run({
              name: 'form submit',
              'submit?' : true,
              form: $(this).parent('form').attr('id'),
              data: $(this).parent('form').serializeJSON()
            });
          });
        }
      ); // === each
    }
  ); // === push



})(); // === end scope =================================








