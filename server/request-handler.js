/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */

var url = require('url');
var fs = require('./file-store');
var _ = require('underscore');

var classes = ['classes'];
var resources = [ 'room', 'room1', 'room2', 'messages'];

var store = {
    'classes': {
      'room1' : [],
      'room2' : [],
      'messages' : [],
      'room': []
  }
};

var handleRequest = function(request, response) {
  /* the 'request' argument comes from nodes http module. It includes info about the
  request - such as what URL the browser is requesting. */

  /* Documentation for both request and response can be found at
   * http://nodemanual.org/0.8.14/nodejs_ref_guide/http.html */
  //store['class']['resource'] = read it from the from

  var requestRoute = parseRoute( request.url );
  if ( classes.indexOf(requestRoute['aggregate']) < 0  ||
       resources.indexOf(requestRoute['resource']) < 0)  {
    sendResponse(404, '[]', response);
    return;
  }

  if (request.method === 'GET') {
      sendResponse(200, JSON.stringify( store[ requestRoute['aggregate'] ][ requestRoute['resource'] ] ), response);
      return;
  } 

  if (request.method === 'POST') {
    var data='';
    request.on('data', function(chunk) {
      data += chunk;
    });
    request.on('end', function() {
      store[ requestRoute['aggregate'] ][ requestRoute['resource'] ].push( JSON.parse(data) ) ;
      sendResponse(201, '', response);
    });
    return
  } 

  if (request.method === 'OPTIONS') {
    console.log('OPTIONS');
    sendResponse('200', '', response);
  }

};

var parseRoute = function(requestUrl) {
    var pathname = url.parse(requestUrl).pathname;
    var route = pathname.split('/');
    return { 'aggregate': route[1],
             'resource': route[2]};
};

var sendResponse = function(statusCode, responseText, response) {
  sendHeaders(statusCode, response)
  response.end(responseText);
};

var sendHeaders = function(statusCode, response) {
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = "text/plain";
  response.writeHead(statusCode, headers);
}

/* These headers will allow Cross-Origin Resource Sharing (CORS).
 * This CRUCIAL code allows this server to talk to websites that
 * are on different domains. (Your chat client is running from a url
 * like file://your/chat/client/index.html, which is considered a
 * different domain.) */
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

module.exports = {handleRequest: handleRequest};
