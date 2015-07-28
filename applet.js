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


})(); // === end scope =================================








