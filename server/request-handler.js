/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */

var url = require('url');

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
    //console.log('Cannot find ', request.url, requestRoute);
    respond(404, '[]', response);
    return;
  }

  if (request.method === 'GET') {
      console.log('---RESP:', JSON.stringify( store[ requestRoute['aggregate'] ][ requestRoute['resource'] ] ) );
      respond(200, JSON.stringify( store[ requestRoute['aggregate'] ][ requestRoute['resource'] ] ), response);
  } else if (request.method === 'POST') {
    var data='';
    request.on('data', function(chunk) {
      data += chunk;
    });
    request.on('end', function() {
      store[ requestRoute['aggregate'] ][ requestRoute['resource'] ].push( JSON.parse(data) ) ;
      console.log( '---STORE:', store );
      console.log( '---      ', store['classes']['room1']);
      respond(201, '', response);
    });
  } else if (request.method === 'OPTIONS') {
    console.log('request came in of type OPTIONS');
  }

};

var parseRoute = function(requestUrl) {
    var pathname = url.parse(requestUrl).pathname;
    var route = pathname.split('/');
    console.log('ROUTE: ', route);
    return { 'aggregate': route[1],
             'resource': route[2]};
};

var respond = function(statusCode, responseText, response) {
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = "text/plain";
  response.writeHead(statusCode, headers);
  response.end(responseText);
};

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
