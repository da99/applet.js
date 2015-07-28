"use strict";
/* jshint undef: true, unused: true */
/* global Applet, describe, it, expect, beforeEach */

describe('Applet:', function () {

  beforeEach(function () {
    $('#THE_STAGE').empty();
  });

  describe('id:', function () {

    it('adds ID attr to element', function () {
      var stage = $('#THE_STAGE');
      stage.html('<div>id</div>');
      var id = Applet.id($('#THE_STAGE div:first'));
      expect(
        $('#' + id).html()
      ).toEqual('id');
    }); // === it adds ID attr to element

    it('does not override original ID', function () {
      var stage = $('#THE_STAGE');
      stage.html('<div id="non_override_1">override id</div>');
      var id = Applet.id($('#THE_STAGE div:first'));
      expect(id).toEqual('non_override_1');
    }); // === it does not override original ID

  }); // === describe id =================

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

}); // === describe Applet =================
