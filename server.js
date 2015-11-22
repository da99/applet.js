"use strict";
/* jshint esnext: true, undef: true, unused: true */
/* global require, process */


var koa        = require('koa');
var koa_static = require('koa-static');
var router     = require('koa-router')();
var port       = parseInt(process.env.PORT);
var app        = koa();
var logger     = require('koa-logger');

function json(app, o) {
  app.set('Content-Type', 'application/json');
  app.set('Access-Control-Allow-Origin', '*');
  app.body = JSON.stringify(o);
}

//Create a server
app.use(logger());
app.use(koa_static('.'));

router.post('/', function* (next) {
  json(this, {when: 'for now'});
  yield next;
});

router.get('/_csrf', function* (next) {
  json(this, {_csrf: 'some_value'});
  yield next;
});

router.post('/html', function* (next) {
  this.set('Content-Type', 'text/html');
  this.body = "<html><body>Some html.</body></html>";
  yield next;
});

router.post('/404-html', function* (next) {
  this.set('Content-Type', 'text/html');
  this.response.status = 404;
  this.body = "<p>Not found: " + this.request.url + "</p>";
  yield next;
});

router.post("/string-as-html", function* (next) {
  this.set('Content-Type', 'text/html');
  this.body = ("Some invalid html.");
  yield next;
});

router.post("/text", function* (next) {
  this.set('Content-Type', 'text/plain');
  this.body = ("Some plain text.");
  yield next;
});

router.post("/json", function* (next) {
  json(this, {msg: 'get smart'});
  yield next;
});

app.use(router.routes());
app.use(router.allowedMethods());
app.use(function* (next) {
  if (!this.body) {
    this.response.status = 404;
    json(this, {msg: 'not found: ' + this.request.method + ' ' + this.request.url});
  }
  yield next;
});

app.listen(port, function() {
  console.warn("Server listening on: http://localhost:%s", port);
});



