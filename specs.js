
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

