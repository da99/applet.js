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
    if (req.url === '/') {
      resp.writeHead(200, h);
      resp.end(JSON.stringify({when: 'for now'}));
    } else {
      resp.writeHead(404, h);
      resp.end(JSON.stringify({msg: 'not found: ' + req.method + ' ' + req.url}));
    }
  }
);

//Lets start our server
var PORT = 4567;
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    C.log("Server listening on: http://localhost:%s", PORT);
});
