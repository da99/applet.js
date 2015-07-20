"use strict";

var Applet = {

  stacks : {
    attrs : {},
    funcs : [],
    attr_funcs : [] // --- Example: show_if : [], render : [], etc.
  },

  bool : function (o, key) {
    if (!_.has(o, key))
      throw new Error('Key not found: ' + key);

    return !!o[key];
  },

  log : function (str) {
    if (window.console) {
      return console.log.apply(console, arguments);
    }
  },

  _id : -1,

  // Get id or (create id, return it)
  id : function (raw, prefix) {
    var o = $(raw);
    var old = o.attr('id');

    if (old && !_.isEmpty(old))
      return old;

    Applet._id = Applet._id + 1;
    var new_id = (prefix || 'id_for_applet') + '_' + Applet._id.toString();
    o.attr('id', new_id);
    return new_id;
  },

  run: function (raw_data, func) {
    if (_.isFunction(raw_data))
      return Applet.stacks.funcs.push(raw_data);

    if (_.isString(raw_data) && _.isFunction(func) && raw_data === "prepend") {
      return Applet.stacks.funcs.unshift(func);
    }

    var data = {};

    if (raw_data.name === 'new node') {
      _.each(raw_data.attrs, function (ignore, attr_key) {

        _.detect(
          Applet.stacks.attr_funcs[attr_key],

            function (f) {
              if (_.contains(raw_data.used_funcs, f))
                return;

              f(raw_data);
              raw_data.used_funcs.push(f);
              return raw_data.name !== "new node";
            }

        ); // === detect

        // === Add to dom:
        if (raw_data.name === 'new node') {
          if (raw_data.$.parent().length === 0)
            raw_data.script.after(raw_data.$);
        }
      }); // _.each attrs
      return;
    } // === if new node

    _.each(raw_data, function (v, k) {
      data[k] = v;
      if (!_.startsWith(k, '!') && !_.has(raw_data, '!' + k))
        data['!'+k] = !v;
    });

    _.each(Applet.stacks.funcs, function (f) {
      f(data);
    });

  }
};

// === compile
Applet.run(function (e) {

  if (e.name !== 'compile scripts') {
    return;
  }

  var list = $('script[type="text/applet"]').not('script.compiled');
  if (list.length < 1)
    return;

  var attr_names = _.compact(_.map(Applet.stacks.funcs, function (f) {
    var result = f({name: 'attr'});
    if (!result)
      return null;

    if (!Applet.stacks.attr_funcs[result])
      Applet.stacks.attr_funcs[result] = [];

    Applet.stacks.attr_funcs.push(f);

    return result;
  }));

  var any_with_attrs   = _.map(attr_names, function (name) {
    return '*[' + name + ']';
  }).join(',');

  _.each(list, function (raw_script) {
      var script    = $(raw_script);
      var script_id = Applet.id(raw_script);

      _.each($(script.html()).find(any_with_attrs).addBack(any_with_attrs), function (raw) {
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
}); // == run compile

// === show_if
Applet.run(function (e) {
  if (!Applet.stacks.attrs.show_if)
    Applet.stacks.attrs.show_if = [];

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

}); // === run show_if

// === render
Applet.run('prepend', function (e) {
  switch (e.name) {
    case 'attr':
      return 'render';

    case 'raw node':
      e.is_raw = false;
      Applet.log(e);
    break;
  } // === switch e.name
});






