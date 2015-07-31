"use strict";
/* jshint undef: true, unused: true */
/* global require */

require('seneca')()
.add(
  {hello : 'goodbye'},
  function (message, done) {
    done(null, {time: 'for now'});
  }
)
.listen(4567);
