
$(function () {
  Applet.run({name: 'compile scripts'});
  Applet.run({"logged_in?": false});

  Applet.run({num: {number: 1}});
  Applet.run({num: {number: 2}});
  Applet.run({num: {number: 3}});

  Applet.run({num_name: {word: 'three'}});
  Applet.run({num_name: {word: 'two'}});
  Applet.run({num_name: {word: 'one'}});

  console.log(
    Applet.attrs($('<div id="000" show_if="happy?"></div>')[0])
  )

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
