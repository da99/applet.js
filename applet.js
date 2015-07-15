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
      env.$.hide();

      // === Add to dom:
      if (env.is_parent)
        env.script.after(env.$);

      var val = env.val;
      var id = Applet.id(env.$);
      env.append(function (e) {
        if (!_.has(e.data, val))
          return;

        if (e.data[val])
          $('#' + id).show();
        else
          $('#' + id).hide();
      });
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

    var attr_names = _.keys(Applet.attrs);
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
          Applet.attrs[attr]({
            script     : script,
            raw_script : raw_script,
            raw        : raw,
            $          : dom,
            val        : dom.attr(attr),
            is_child   : parent.length > 0,
            is_parent  : parent.length === 0,
            append     : Applet.append
          });
        }); // === each attr_names
      });

    }); // === each script applet

  }, // === compile

  compile_script_tag : function (raw_script) {

    var script    = $(raw_script);
    var script_id = Applet.id(raw_script);
    $(script.html()).each(function (i, raw_child) {

      var child = $(raw_child);
      _.each(_.keys(Applet.attrs), function (name) {

        var val = child.attr(name);
        if (!val)
          return;

        Applet.nodes.push({
          id:     Applet.id(child, script_id),
          action: name,
          value:  val
        });

        child.removeAttr(name);

        switch (name) {

          case 'show_if':
            if (Applet.bool( val ))
              child.show();
            else
              child.hide();
            break;

          case 'hide_if':
            if (Applet.bool( val ))
              child.hide();
            else
              child.show();
            break;

          default:
            Applet.log('I do not know what to do on: ' + name);
        } // === switch

      }); // === each Applet action

      script.after(child);
    });

  }, // === compile_script

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

if (window.$)
  $(function () {
    Applet.compile();
  });

