"use strict";
/* jshint esnext: true, undef: true, unused: true */
/* global require, process */


const app          = require('express')();
const serve_static = require('serve-static')('.');
const port         = parseInt(process.env.PORT);
const logger       = require('morgan')('dev');

function json(app, o) {
  app.set('Content-Type', 'application/json');
  app.set('Access-Control-Allow-Origin', '*');
  app.send( JSON.stringify(o) );
}

//Create a server
app.use(logger);
app.use(serve_static);

app.post('/', function (req, resp) {
  json(resp, {when: 'for now'});
});

app.get('/_csrf', function (req, resp) {
  json(resp, {_csrf: 'some_value'});
});

app.post('/html', function (req, resp) {
  resp.set('Content-Type', 'text/html');
  resp.send( "<html><body>Some html.</body></html>" );
});

app.post('/404-html', function (req, resp) {
  resp
  .set('Content-Type', 'text/html')
  .status( 404 )
  .send( "<p>Not found: " + req.originalUrl + "</p>" )
  .end();
});

app.post("/string-as-html", function (req, resp) {
  resp.set('Content-Type', 'text/html');
  resp.send("Some invalid html.");
});

app.post("/text", function (req, resp) {
  resp.set('Content-Type', 'text/plain');
  resp.send("Some plain text.");
});

app.post("/json", function (req, resp) {
  resp.send( json(resp, {msg: 'get smart'}) );
});

app.use(function (req, resp) {
  resp
  .status(404)
  .send({msg: 'not found: ' + req.method + ' ' + req.originalUrl})
  .end();
});

app.listen(port, function() {
  console.warn("Server listening on: http://localhost:%s", port);
});



