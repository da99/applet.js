"use strict";

var Applet = {

  stacks : {
    funcs : []
  },

  append : function (func) {
    return Applet.stacks.funcs.push(func);
  },

  attrs : {
    show_if : function (env) {
    },

    hide_if : function (env) {
      return new Error('Not done');
    },

    template_for : function (env) {
      return new Error('Not done');
    },

    "var": function (env) {
      return new Error('Not done');
    },

    prepend : function (env) {
      return new Error('Not done');
    },

    append : function (env) {
      return new Error('Not done');
    }
  },

  bool : function (o, key) {
    if (!_.has(o, key))
      throw new Error('Key not found: ' + key);

    return !!o[key];
  },

  nodes : [
  ],

  log : function (str) {
    if (window.console) {
      return console.log.apply(console, arguments);
    }
  },

  _id : -1,

  id : function (o, prefix) {
    if (_.isString(o.id) &&  !_.isEmpty(o.id))
      return o.id;

    if (o.attr && _.isString(o.attr('id')) && !_.isEmpty(o.attr('id')))
      return o.attr('id');

    Applet._id = Applet._id + 1;
    var new_id = (prefix || 'id_for_applet') + '_' + Applet._id.toString();
    $(o).attr('id', new_id);
    return new_id;
  },

  compile : function () {

    var attr_names = _.compact(_.map(Applet.stacks.funcs, function (f) {
      f({name: 'find_attr'});
    }));

    var any_with_attrs   = _.map(attr_names, function (name) {
      return '*[' + name + ']';
    }).join(',');

    $('script[type="text/applet"]').each(function (ignore, raw_script) {
      var script = $(raw_script);
      var script_id = Applet.id(raw_script);

      $(script.html()).find(any_with_attrs).addBack(any_with_attrs).each(function (ignore, raw) {
        var dom = $(raw);
        _.each(attr_names, function (attr) {
          if (!dom.attr(attr))
            return;
          var parent = dom.parent();
          _.each(Applet.stacks.funcs, function (f) {
            f({
              name       : 'raw_node',
              script     : script,
              raw_script : raw_script,
              raw        : raw,
              $          : dom,
              val        : dom.attr(attr),
              is_child   : parent.length > 0,
              is_parent  : parent.length === 0,
              append     : Applet.append
            });
          });
        }); // === each attr_names
      });

    }); // === each script applet

  }, // === compile

  run: function (raw_data) {
    // === first data
    // === after first data
    //
    var data = {};
    _.each(raw_data, function (v, k) {
      data[k] = v;
      if (!_.startsWith(k, '!') && !_.has(raw_data, '!' + k))
        data['!'+k] = !v;
    });

    _.each(Applet.stacks.funcs, function (f) {
      f({data: data});
    });

  }
};

Applet.run(function (e) {

  switch (e.name) {

    case 'find_attr':
      return 'show_if';

    case 'raw_node':
      e.$.hide();

      // === Add to dom:
      if (e.is_parent)
        e.script.after(e.$);
      return;

    case 'attr':
      if (!e.show_if)
        return;

      if (!_.has(e.data, e.show_if))
        return;

      if (e.data[e.show_if])
        $('#' + e.id).show();
      else
        $('#' + e.id).hide();
      return;

  } // === switch e.name

}); // === show_if

if (window.$)
  $(function () {
    Applet.compile();
  });






