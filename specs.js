"use strict";
/* jshint undef: true, unused: true */
/* global Applet, describe, it, expect, beforeEach */

var app;

describe('Applet:', function () {

  beforeEach(function () {
    $('#THE_STAGE').empty();
  });

  describe('dom_id:', function () {

    it('adds ID attr to element', function () {
      var stage = $('#THE_STAGE');
      stage.html('<div>id</div>');
      var id = Applet.dom_id($('#THE_STAGE div:first'));
      expect(
        $('#' + id).html()
      ).toEqual('id');
    }); // === it adds ID attr to element

    it('does not override original ID', function () {
      var stage = $('#THE_STAGE');
      stage.html('<div id="non_override_1">override id</div>');
      var id = Applet.dom_id($('#THE_STAGE div:first'));
      expect(id).toEqual('non_override_1');
    }); // === it does not override original ID

  }); // === describe dom_id =================

  describe('attrs:', function () {

    it('returns attrs of node', function () {
      var result = Applet.attrs($('<div id="000" img=".png"></div>')[0]);
      expect(result).toEqual({id: "000", img: ".png"});
    }); // === it returns attrs of node

  }); // === describe attrs =================

  describe('is_true:', function () {

    it('returns true if key is "truthy"', function () {
      expect(
        Applet.is_true({time: 'morning'}, 'time')
      ).toEqual(true);
    }); // === it returns true if key is "truthy"

    it('returns true if: !key , key is !truthy', function () {
      expect(
        Applet.is_true({time: false}, '!time')
      ).toEqual(true);
    }); // === it returns true if: !key , key is !truthy

    it('handles nested keys', function () {
      expect(
        Applet.is_true({first: {second: { third: true}}}, '!first.second.third')
      ).toEqual(true);
    }); // === it handles nested keys

    it('handles multiple exclamation marks', function () {
      expect(
        Applet.is_true({first: false}, '!!!first')
      ).toEqual(true);
    }); // === it handles multiple exclamation marks

    it('returns undefined if one non-nested key is specified, but not found', function () {
      expect(
        Applet.is_true({}, 'first')
      ).toEqual(undefined);
    }); // === it returns undefined if one non-nested key is specified, but not found

  }); // === describe is_true =================

  describe('node_array:', function () {

    it('returns an Array when passed a String', function () {
      var arr = Applet.node_array('<div id="111" show_if="happy?"><span></span></div>');

      expect(arr).toEqual([
        {
        tag:   'DIV',
        attrs:  {id: '111', show_if: 'happy?'},
        custom: {},
        childs: [
          {tag: 'SPAN', attrs: {}, custom: {}, childs: []}
        ]
      }
      ]);
    }); // === it returns an Array when passed a String

    it('returns raw text nodes', function () {
      var arr = Applet.node_array('<div><span>a<span></span>b</span></div>');

      expect(
        _.pluck(arr[0].childs[0].childs, 'nodeValue')
      ).toEqual(
      ['a', undefined, 'b']
      );
    }); // === it returns raw text nodes

  }); // === describe node_array =================

  describe('compiling scripts:', function () {

    it('does not re-evaluate scripts', function () {
      $('#THE_STAGE').html('<script type="text/applet"><div>OK</div></script>');
      Applet.each_raw_script(Applet.insert_before);
      Applet.each_raw_script(Applet.insert_before);
      Applet.each_raw_script(Applet.insert_before);
      expect($('#THE_STAGE').html()).toEqual('<div>OK</div><script type="text/applet" class="compiled"></script>');
    }); // === it does not re-evaluate scripts

    it('keeps evaulating nested scripts until done', function () {
      $('#THE_STAGE').html(
        '<script type="text/applet">' +
        '<script type="text/applet">' +
        '<script type="text/applet">' +
        '<div>OK</div>' +
        '</script>' +
        '</script>' +
        '</script>'
      );

      Applet.each_raw_script(Applet.insert_before);
      expect(
        $('#THE_STAGE').html()
      ).toEqual('<div>OK</div><script type="text/applet" class="compiled"></script><script type="text/applet" class="compiled"></script><script type="text/applet" class="compiled"></script>');
    }); // === it keeps evaulating nested scripts until done
  }); // === describe compiling scripts =================

  describe('remove_attr:', function () {

    it('returns value of the attribute', function () {
      $('#THE_STAGE').html('<div show_if="one"></div>');
      expect(
        Applet.remove_attr($('#THE_STAGE div:first'), 'show_if')
      ).toEqual('one');
    }); // === it returns value of the attribute

    it('removes attribute from node', function () {
      $('#THE_STAGE').html('<div id="target" show_if="one"></div>');
      Applet.remove_attr($('#THE_STAGE div:first'), 'show_if');
      expect(
        _.reduce(
          $('#THE_STAGE div:first')[0].attributes,
          function (a, v) { a[v.name] = v.value; return a; },
          {}
        )
      ).toEqual({id: 'target'});
    }); // === it removes attribute from node

  }); // === describe remove_attr =================

  describe('standard_name:', function () {

    it('lowercases names', function () {
      expect(
        Applet.standard_name('NAME NAME')
      ).toEqual('name name');
    }); // === it lowercases names

    it('trims string', function () {
      expect(
        Applet.standard_name('  name  ')
      ).toEqual('name');
    }); // === it trims string

    it('compacts multiple spaces', function () {
      expect(
        Applet.standard_name('name    name')
      ).toEqual('name name');
    }); // === it compacts multiple spaces

  }); // === describe standard_name =================

  describe('top_descendents:', function () {

    it('returns self if selector matches', function () {
      $('#THE_STAGE').html('<div id="target" template="num"></div>');
      expect(
        Applet.top_descendents($('#THE_STAGE').children(), '*[template]')[0].attr('id')
      ).toEqual('target');
    }); // === it returns self if selector matches

    it('returns first children matching selector', function () {
      $('#THE_STAGE').html('<div><span class="top"></span><span class="top"></span></div>');
      expect(
        _.map(
          Applet.top_descendents($('#THE_STAGE').children(), '.top'),
          function (n) { return n[0].tagName; }
        )
      ).toEqual(['SPAN', 'SPAN']);
    }); // === it returns first children

    it('does not return nested matching descendants if ancestor matches selector', function () {
      $('#THE_STAGE').html(
        '<div><div id="target" class="top"><span class="top"></span><span class="top"></span></div><div>'
      );
      expect(
        _.map(
          Applet.top_descendents($('#THE_STAGE').children(), '.top'),
          function (n) { return [n[0].tagName, n.attr('id')]; }
        )
      ).toEqual([['DIV', 'target']]);
    }); // === it does not return nested matching descendants if ancestor matches selector

  }); // === describe closest =================

  describe('scripts:', function () {

    it('inserts contents before SCRIPT tag', function () {
      $('#THE_STAGE')
      .html('<script type="text/applet"><div id="target" show_if="logged_in?">logged</div></script>');
      app = new Applet([Applet.funcs.script, Applet.funcs.show_if]);
      expect(
        $($('#THE_STAGE').children().first()).attr('id')
      ).toEqual('target');
    }); // === it inserts contents before SCRIPT tag

  }); // === describe scripts =================

  describe('show_if:', function () {

    it('sets node to display=none by default', function () {
      $('#THE_STAGE')
      .html('<div id="target" data-show_if="logged_in?">logged</div>');
      app = new Applet(Applet.funcs.show_if);
      expect(
        $('#target').css('display')
      ).toEqual('none');
    }); // === it sets node to display=none by default

    it('makes node visible if data has a truthy kv', function () {
      $('#THE_STAGE')
      .html('<div id="target" data-show_if="logged_in?">logged</div>');

      app = new Applet(Applet.funcs.show_if);
      app.run('data', {'logged_in?': true});

      expect(
        $('#target').css('display')
      ).toEqual('block');
    }); // === it makes node visible if data has a truthy kv

  }); // === describe show_if =================

  describe('template:', function () {

    it('does not render by default', function () {
      $('#THE_STAGE').html(
        '<div data-template="num">{{num.word}} {{num.num}}</div>'
      );

      app = new Applet([Applet.funcs.dom, Applet.funcs.template]);

      expect(
        _.map($('#THE_STAGE').children(), function (n) {
          return $(n).attr('type');
        })
      ).toEqual(['text/applet_placeholder', 'text/applet']);
    }); // === it does not render by default

    it('renders elements on top of where it is found', function () {
      $('#THE_STAGE').html(
        '<script type="text/applet"><div template="num">{{num.word}} {{num.num}}</div></script>'
      );

      app = new Applet([Applet.funcs.dom, Applet.funcs.template]);
      app
      .run('compile scripts')
      .run('data', {num: {word: 'one', num: 1}})
      ;

      expect(
        $('#THE_STAGE').children().first().prop('outerHTML')
      ).toEqual('<div>one 1</div>');
    }); // === it renders elements on top of where it is found

    it('replaces elements, including text nodes', function () {
      $('#THE_STAGE').html(
        '<script type="text/applet"><div template="num">{{num.word}} {{num.num}}</div></script>'
      );

      app = new Applet([Applet.funcs.dom, Applet.funcs.template]);
      app
      .run('compile scripts')
      .run('data', {num: {word: 'one', num: Date.now().toString()}})
      .run('data', {num: {word: 'two', num: 2}})
      ;


      expect(
        $('#THE_STAGE').text()
      ).toEqual('two 2');
    }); // === it replaces elements, including text nodes

    it('appends rendered template above w/ option: top', function () {
      $('#THE_STAGE').html(
        '<script type="text/applet"><div template="num top">{{num.word}} {{num.num}}</div></script>'
      );

      app = new Applet([Applet.funcs.dom, Applet.funcs.template]);
      app
      .run('compile scripts')
      .run('data', {num: {word: 'one', num: 1}})
      .run('data', {num: {word: 'two', num: 2}})
      ;

      expect(
        $('#THE_STAGE').text()
      ).toEqual('two 2one 1');
    }); // === it appends rendered template above w/ option: top

    it('appends rendered template below w/ option: bottom', function () {
      $('#THE_STAGE').html(
        '<script type="text/applet"><div template="num bottom">{{num.word}} {{num.num}}</div></script>'
      );

      app = new Applet([Applet.funcs.dom, Applet.funcs.template]);

      app
      .run('compile scripts')
      .run('data', {num: {word: 'one', num: 1}})
      .run('data', {num: {word: 'two', num: 2}})
      .run('data', {num: {word: 'three', num: 3}})
      ;

      expect(
        $('#THE_STAGE').text()
      ).toEqual('one 1two 2three 3');
    }); // === it appends rendered template above w/ option: bottom

    it('renders template w/ attr functionality', function () {
      $('#THE_STAGE').html(
        '<script type="text/applet"><div template="num" id="target"><span show_if="show_num?">{{num.word}}</span></div></script>'
      );

      app = new Applet(_.values(Applet.funcs));
      app
      .run('compile scripts')
      .run('data', {'show_num?': true, num: {word: 'number'}})
      ;

      expect(
        $('#target span').css('display')
      ).toEqual('inline');

      app.run('data', {'show_num?' : false});

      expect(
        $('#target span').css('display')
      ).toEqual('none');

    }); // === it renders template w/ attr functionality

  }); // === describe template =================

  describe('forms:', function () {

    it('adds handlers to buttons', function () {
      $('#THE_STAGE').html(
        '<form id="target"><input type="hidden" name="hello" value="goodbye" /><button class="submit">SUBMIT</button></form>'
      );
      app = new Applet([Applet.funcs.dom, Applet.funcs.form]);

      var result = null;
      app.new_func(function (o) {
        if (o.name === 'ajax') {
          result = o.data.hello;
          o['send?'] = false;
        }
      });

      $('#THE_STAGE button.submit').click();
      expect(result).toEqual('goodbye');
    }); // === it adds handlers to buttons

    it('by default, send form data using AJAX', function (done) {
      $('#THE_STAGE').html(
        '<form action="http://localhost:4567/" id="target"><input type="hidden" name="hello" value="goodbye" /><button class="submit">SUBMIT</button></form>'
      );

      app = new Applet(
        Applet.funcs.dom,
        Applet.funcs.ajax,
        Applet.funcs.form,
        function (o) {
          if (o.name === 'after ajax') {
            o.promise.then(function (err, text, xhr) {
              expect((err && 'Error: ' + xhr.status) || JSON.parse(text).when).toEqual('for now');
              done();
            });
          }
        }
      );

      $('#THE_STAGE button.submit').click();
    }, 1500); // === it by default, send form data using AJAX

  }); // === describe forms =================


}); // === describe Applet =================
