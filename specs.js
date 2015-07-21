
$(function () {
  Applet.run({name: 'compile scripts'});
  Applet.run({"logged_in?": false});

  Applet.run({num: {number: 1}});
  Applet.run({num: {number: 2}});
  Applet.run({num: {number: 3}});

  Applet.run({num_name: {word: 'three'}});
  Applet.run({num_name: {word: 'two'}});
  Applet.run({num_name: {word: 'one'}});

});


describe('attrs:', function () {

  beforeEach(Applet.reset);

  it('returns attrs of node', function () {
    var result = Applet.attrs($('<div id="000" img=".png"></div>')[0]);
    expect(result).toEqual({id: "000", img: ".png"});
  }); // === it returns attrs of node

  it('ignores custom attributes', function () {
    var result = Applet.attrs($('<div show_if="happy?" id="111" img=".png"></div>')[0]);
    expect(result).toEqual({id: "111", img: ".png"});
  }); // === it ignores custom attributes

}); // === describe attrs =================


describe('custom_attrs:', function () {

  beforeEach(Applet.reset);

  it('returns custom attrs of node', function () {
    Applet.run(function (e) { return 'hide_if'; });

    var result = Applet.custom_attrs($('<div show_if="sad?" hide_if="happy?"></div>')[0]);
    expect(result).toEqual(
      {show_if: "sad?", hide_if: 'happy?'}
    );
  }); // === it returns custom attrs of node

  it('ignores regular attributes', function () {
    var result = Applet.custom_attrs($('<div show_if="mellow?" id="222"></div>')[0]);
    expect(result).toEqual(
      {show_if: "mellow?"}
    );
  }); // === it ignores regular attributes

}); // === describe custom_attrs =================
