"use strict";
/* jshint undef: true, unused: true */
/* global Applet, describe, it, expect, beforeEach */

$(function () {
});

describe('Applet:', function () {

  beforeEach(function () {
    $('#THE_STAGE').empty();
    Applet.reset();
  });

  describe('compiling scripts:', function () {

    it('does not re-evaluate scripts', function () {
      $('#THE_STAGE').html('<script type="text/applet"><div>OK</div></script>');
      Applet.run('compile scripts');
      Applet.run('compile scripts');
      Applet.run('compile scripts');
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

      Applet.run('compile scripts');
      expect(
        $('#THE_STAGE').html()
      ).toEqual('<div>OK</div><script type="text/applet" class="compiled"></script><script type="text/applet" class="compiled"></script><script type="text/applet" class="compiled"></script>');
    }); // === it keeps evaulating nested scripts until done
  }); // === describe compiling scripts =================

}); // === describe Applet =================

describe('attrs:', function () {

  beforeEach(Applet.reset);

  it('returns attrs of node', function () {
    var result = Applet.attrs($('<div id="000" img=".png"></div>')[0]);
    expect(result).toEqual({id: "000", img: ".png"});
  }); // === it returns attrs of node

}); // === describe attrs =================


describe('node_array:', function () {

  beforeEach(function () {
    $('#THE_STAGE').empty();
    Applet.reset();
  });

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
