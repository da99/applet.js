"use strict";
/* jshint undef: true, unused: true */
/* global Applet, describe, it, expect, beforeEach */


var log;
log = Applet.log = function () {
  if (window.console)
    return console.log.apply(console, arguments);
  return this;
};

function outer_html(raw) {
  return raw.map(function () { return $(this).prop('outerHTML'); }).toArray().join('');
}

var app;

var Default_App = function () {
  var app = new Applet( _.toArray(arguments) );
  app.run("dom");
  return app;
};

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

  describe('show_if:', function () {

    it('sets node to display=none by default', function () {
      $('#THE_STAGE')
      .html('<div id="target" data-show_if="logged_in?">logged</div>');
      app = new Default_App(Applet.funcs.show_if);
      expect(
        $('#target').css('display')
      ).toEqual('none');
    }); // === it sets node to display=none by default

    it('makes node visible if data has a truthy kv', function () {
      $('#THE_STAGE')
      .html('<div id="target" data-show_if="logged_in?">logged</div>');

      app = new Default_App(Applet.funcs.show_if);
      app.run('data', {'logged_in?': true});

      expect(
        $('#target').css('display')
      ).toEqual('block');
    }); // === it makes node visible if data has a truthy kv

  }); // === describe show_if =================

  describe('hide_if:', function () {

    it('does not alter css display by default', function () {
      $('#THE_STAGE')
      .html('<div id="target" data-hide_if="loaded?">logging</div>');
      app = new Default_App(Applet.funcs.hide_if);
      expect(
        $('#target').css('display')
      ).toEqual('block');
    }); // === it

    it('sets display="none" if data has a truthy kv', function () {
      $('#THE_STAGE')
      .html('<div id="target" data-hide_if="loaded?">Loading</div>');

      app = new Default_App(Applet.funcs.hide_if);
      app.run('data', {'loaded?': true});

      expect(
        $('#target').css('display')
      ).toEqual('none');
    }); // === it

  }); // === describe hide_if =================


  describe('template:', function () {

    it('does not render by default', function () {
      $('#THE_STAGE').html(
        '<script type="text/mustache/num">{{num.word}} {{num.num}}</script>'
      );

      app = new Default_App(Applet.funcs.template);

      expect(
        _.map($('#THE_STAGE').children(), function (n) {
          return $(n).attr('type');
        })
      ).toEqual(['text/mustache/num']);
    }); // === it does not render by default

    it('renders elements on top of where it is found', function () {
      $('#THE_STAGE').html(
        '<script type="text/mustache/num"><div>{{num.word}} {{num.num}}</div></script>'
      );

      (app = new Default_App(Applet.funcs.template))
      .run('data', {num: {word: 'one', num: 1}})
      ;

      expect(
        outer_html($('#THE_STAGE').children().first())
      ).toEqual('<div>one 1</div>');
    }); // === it renders elements on top of where it is found

    it('replaces elements, including text nodes', function () {
      $('#THE_STAGE').html(
        '<script id="target" type="text/mustache/num"><div>{{num.word}} {{num.num}}</div></script>'
      );

      (app = new Default_App(Applet.funcs.template))
      .run('data', {num: {word: 'one', num: Date.now().toString()}})
      .run('data', {num: {word: 'two', num: 2}})
      ;


      expect(
        outer_html( $('#THE_STAGE').find('div') )
      ).toEqual('<div>two 2</div>');
    }); // === it replaces elements, including text nodes

    it('appends rendered template above w/ option: top', function () {
      $('#THE_STAGE').html(
        '<script type="text/mustache-top/num"><div>{{num.word}} {{num.num}}</div></script>'
      );

      (app = new Default_App(Applet.funcs.template))
      .run('data', {num: {word: 'one', num: 1}})
      .run('data', {num: {word: 'two', num: 2}})
      ;
      expect(
        outer_html( $('#THE_STAGE').find('div') )
      ).toEqual('<div>two 2</div><div>one 1</div>');
    }); // === it appends rendered template above w/ option: top

    it('appends rendered template below w/ option: bottom', function () {
      $('#THE_STAGE').html(
        '<script type="text/mustache-bottom/num"><div>{{num.word}} {{num.num}}</div></script>'
      );

      (app = new Default_App(Applet.funcs.template))
      .run('data', {num: {word: 'one', num: 1}})
      .run('data', {num: {word: 'two', num: 2}})
      .run('data', {num: {word: 'three', num: 3}})
      ;

      expect(
        outer_html($('#THE_STAGE').find('div'))
      ).toEqual('<div>one 1</div><div>two 2</div><div>three 3</div>');
    }); // === it appends rendered template above w/ option: bottom

    it('renders template w/ attr functionality', function () {
      $('#THE_STAGE').html(
        '<script type="text/mustache/num"><div id="target"><span data-show_if="show_num?">{{num.word}}</span></div></script>'
      );

      (app = new Default_App(_.values(Applet.funcs)))
      .run('data', {'show_num?': true, num: {word: 'number'}})
      ;

      expect(
        $('#target span').css('display')
      ).toEqual('inline');

      app.run('data', {'show_num?' : false, num: {word: 'number'}});

      expect(
        $('#target span').css('display')
      ).toEqual('none');

    }); // === it renders template w/ attr functionality

  }); // === describe template =================

  describe('forms:', function () {

    it('adds handlers to buttons (even when deeply nested in the form)', function (done) {
      $('#THE_STAGE').html(
        '<form action="http://localhost:4560" id="target">' +
        '<input type="hidden" name="hello" value="goodbye" />' +
          '<div><div><button class="submit">SUBMIT</button></div></div>' +
          '</form>'
      );

      app = new Default_App(
        function (o, data) {
          if (o.name === 'ajax') {
            o['send?'] = false;
            expect(data.hello).toEqual('goodbye');
            done();
          }
        },
        Applet.funcs.form,
        Applet.funcs.ajax
      );

      $('#THE_STAGE button.submit').click();

    }, 1000); // === it adds handlers to buttons

    it('disables form before making AJAX call', function () {
      $('#THE_STAGE').html(
        '<form action="http://localhost:4560" id="target"><input type="hidden" name="hello" value="goodbye" /><button class="submit">SUBMIT</button></form>'
      );
      app = new Default_App( Applet.funcs.form );
      $('#THE_STAGE button.submit').click();
      expect( $('#target').prop('disabled') ).toEqual( true );
    }); // === it disables form before making AJAX call

    it('re-enables form after AJAX response', function (done) {
      $('#THE_STAGE').html(
        '<form action="http://localhost:4560" id="target"><input type="hidden" name="hello" value="goodbye" /><button class="submit">SUBMIT</button></form>'
      );

      function func(o) {
        if (o.name === 'ajax response') {
          expect($('#' + o.request.form_id).prop('disabled')).toEqual(false);
          done();
        }
      }

      app = new Default_App( Applet.funcs.form, func, Applet.funcs.ajax );
      $('#THE_STAGE button.submit').click();
    }, 1000); // === it re-enables form after AJAX response

    it('by default, send form data using AJAX', function (done) {
      $('#THE_STAGE').html(
        '<form action="http://localhost:4560/" id="target"><input type="hidden" name="hello" value="goodbye" /><button class="submit">SUBMIT</button></form>'
      );

      app = new Default_App(
        Applet.funcs.form,
        Applet.funcs.ajax,
        function (o) {
          if (o.name === 'ajax response') {
            expect(o.response.when).toEqual('for now');
            done();
          }
        }
      );

      $('#THE_STAGE button.submit').click();
    }, 1000); // === it by default, send form data using AJAX

  }); // === describe forms =================

  describe('ajax:', function () {

    it('adds .request.url to AJAX response', function (done) {
      $('#THE_STAGE').html(
        '<form action="http://localhost:4560" id="target"><input type="hidden" name="hello" value="goodbye" /><button class="submit">SUBMIT</button></form>'
      );

      function func(o) {
        if (o.name === 'ajax response') {
          expect(o.request.url).toEqual($('#target').attr('action'));
          done();
        }
      }

      app = new Default_App(Applet.funcs.form, Applet.funcs.ajax, func);
      $('#THE_STAGE button.submit').click();
    }, 1000); // === it adds .request.url to AJAX response

    it('adds .request.data to AJAX response', function (done) {
      $('#THE_STAGE').html(
        '<form action="http://localhost:4560" id="target">' +
        '<input type="hidden" name="my_data" value="stargate" /><button class="submit">SUBMIT</button></form>'
      );

      function func(o) {
        if (o.name === 'ajax response') {
          expect(o.request.data).toEqual({my_data: 'stargate', _csrf: 'some_value'});
          done();
        }
      }

      app = new Default_App(Applet.funcs.form, Applet.funcs.ajax, func);
      $('#THE_STAGE button.submit').click();
    }, 1000); // === it adds .request.data to AJAX response

    it('adds .request.data._csrf to AJAX response', function (done) {
      $('#THE_STAGE').html(
        '<form action="http://localhost:4560" id="target">' +
        '<input type="hidden" name="my_data" value="movie" /><button class="submit">SUBMIT</button></form>'
      );

      function func(o) {
        if (o.name === 'ajax response') {
          expect(o.request.data).toEqual({my_data: 'movie', _csrf: 'some_value'});
          done();
        }
      }

      app = new Default_App(Applet.funcs.form, Applet.funcs.ajax, func);
      $('#THE_STAGE button.submit').click();
    }, 1000); // === it adds .request.data to AJAX response


    it('adds .request.headers to AJAX response', function (done) {
      $('#THE_STAGE').html(
        '<form action="http://localhost:4560" id="target">' +
        '<input type="hidden" name="my_data" value="stargate" /><button class="submit">SUBMIT</button></form>'
      );

      function func(o) {
        if (o.name === 'ajax response') {
          expect(o.request.headers).toEqual({Accept: 'application/json'});
          done();
        }
      }

      app = new Default_App(Applet.funcs.form, Applet.funcs.ajax, func);
      $('#THE_STAGE button.submit').click();
    }, 1000); // === it adds .request.headers to AJAX response

    it('adds .request.form_id to AJAX response', function (done) {
      $('#THE_STAGE').html(
        '<form action="http://localhost:4560" id="target">' +
        '<input type="hidden" name="my_data" value="stargate" /><button class="submit">SUBMIT</button></form>'
      );

      function func(o) {
        if (o.name === 'ajax response') {
          expect(o.request.form_id).toEqual('target');
          done();
        }
      }

      app = new Default_App(Applet.funcs.form, Applet.funcs.ajax, func);
      $('#THE_STAGE button.submit').click();
    }, 1000); // === it adds .request.form_id to AJAX response

    it('sets .response', function (done) {
      $('#THE_STAGE').html(
        '<form action="http://localhost:4560/json" id="target">' +
        '<input type="hidden" name="my_data" value="stargate" /><button class="submit">SUBMIT</button></form>'
      );

      function func(o) {
        if (o.name === 'ajax response') {
          expect(o.response).toEqual({ msg : 'get smart' });
          done();
        }
      }

      app = new Default_App(Applet.funcs.form, Applet.funcs.ajax, func);
      $('#THE_STAGE button.submit').click();
    }); // === it sets .response

    it('sets .response.error if content is invalid JSON', function (done) {
      $('#THE_STAGE').html(
        '<form action="http://localhost:4560/string-as-html" id="target">' +
        '<input type="hidden" name="my_data" value="stargate" /><button class="submit">SUBMIT</button></form>'
      );

      function func(o) {
        if (o.name === 'ajax response') {
          expect(o.response.error).toEqual({tags: ['invalid json'], msg: 'Some invalid html.'});
          done();
        }
      }

      app = new Default_App(Applet.funcs.form, Applet.funcs.ajax, func);
      $('#THE_STAGE button.submit').click();
    }); // === it sets .response.error if content is invalid JSON

    it('sets .response.error to {type: [\'server\'] if server error', function (done) {
      $('#THE_STAGE').html(
        '<form action="http://localhost:4560/404-html" id="target">' +
        '<input type="hidden" name="my_data" value="stargate" /><button class="submit">SUBMIT</button></form>'
      );

      function func(o) {
        if (o.name === 'ajax response') {
          expect(o.response.error).toEqual({tags: ['server', 404], msg: '<p>Not found: /404-html</p>'});
          done();
        }
      }

      app = new Default_App(Applet.funcs.form, Applet.funcs.ajax, func);
      $('#THE_STAGE button.submit').click();
    }); // === it sets .response.error to {type: [\'server\'] if server error

  }); // === describe ajax =================

}); // === describe Applet =================
