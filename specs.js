"use strict";
/* jshint undef: true, unused: true */
/* global Applet, describe, it, expect, beforeEach */

$(function () {
});

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
      Applet.run();
      Applet.run();
      Applet.run();
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

      Applet.run();
      expect(
        $('#THE_STAGE').html()
      ).toEqual('<div>OK</div><script type="text/applet" class="compiled"></script><script type="text/applet" class="compiled"></script><script type="text/applet" class="compiled"></script>');
    }); // === it keeps evaulating nested scripts until done
  }); // === describe compiling scripts =================


}); // === describe Applet =================
