"use strict";
/* jshint undef: true, unused: true */
/* global require */


var http = require('http');
var C    = console;


//Create a server
var server = http.createServer(
  function (req, resp) {
    var h = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin' : '*'};
    C.log(req.method + ' ' + req.url);

    switch (req.url) {

      case "/":
        resp.writeHead(200, h);
        resp.end(JSON.stringify({when: 'for now'}));
      break;

      case "/html":
        h['Content-Type'] = 'text/html';
        resp.writeHead(200, h);
        resp.end("<html><body>Some html.</body></html>");
      break;

      case "/404-html":
        h['Content-Type'] = 'text/html';
        resp.writeHead(404, h);
        resp.end("<p>Not found: " + req.url + "</p>");
      break;

      case "/string-as-html":
        h['Content-Type'] = 'text/html';
        resp.writeHead(200, h);
        resp.end("Some invalid html.");
      break;

      case "/text":
        h['Content-Type'] = 'text/plain';
        resp.writeHead(200, h);
        resp.end("Some plain text.");
      break;

      case "/json":
        resp.writeHead(200, h);
        resp.end(JSON.stringify({msg: 'get smart'}));
      break;

      default:
        resp.writeHead(404, h);
        resp.end(JSON.stringify({msg: 'not found: ' + req.method + ' ' + req.url}));

    } // === switch req.url
  }
);

//Lets start our server
var PORT = 4560;
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    C.log("Server listening on: http://localhost:%s", PORT);
});
