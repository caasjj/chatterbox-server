/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */

 var url = require('url');
 var fs = require('./file-store');
 var _ = require('underscore');

 var bases = ['classes', 'messages'];
 var resources = [ 'rooms', 'room1', 'room2', 'messages'];

 var store = {
  'classes': {
    'room1' : [],
    'room2' : [],
    'messages' : [],
    'rooms': []
  }
};

var handleRequest = function(request, response) {

  var requestRoute = parseRoute( request.url );
  var resource = requestRoute['resource'];
  var base = requestRoute['base'];

  if ( bases.indexOf(base) < 0  ||
      resources.indexOf(resource)< 0)  {
    console.log('-- 404 -- on ', base, '/', resource);
  sendResponse(404, '[]', response);
  return;
}

if (request.method === 'GET') {
  var getData = store[ base ][ resource ];
  if (getData.length > 1) {
    sendResponse(200, JSON.stringify( { 'results': getData }), response);
  } else {
    sendResponse(200, JSON.stringify( getData ), response);
  }
  return;
}

if (request.method === 'POST') {
  console.log('--POST--');
  var postData='';
  request.on('data', function(chunk) {
    postData += chunk;
  });
  request.on('end', function() {
    postData = JSON.parse(postData);
    postData.id = createUniqueId(base, resource);
    postData.createdAt = (new Date(Date.now()) ).toJSON();
    store[ base][ resource ].push( postData ) ;
    sendResponse(201, JSON.stringify({'objectId':postData.id}), response);
    if (resource === 'messages') {
      processRoomData(postData);
    }
    console.log(store.classes.rooms);
  });

  return;
}

if (request.method === 'OPTIONS') {
  sendResponse('200', '', response);
  return;
}
};

var processRoomData = function(postData) {
  if (postData.roomname) {
    store.classes.rooms[ postData.roomname ] = postData.roomname;
  }
};

var createUniqueId = function(base, resource) {
  return (store[base][resource]).length;
};

var existsResource = function (base, resource) {
  return ( (store[base][resource]).length > 0 );
};

var parseRoute = function(requestUrl) {
  var pathname = url.parse(requestUrl).pathname;
  var route = pathname.split('/');
  return { 'base': route[1],
  'resource': route[2]};
};

var sendResponse = function(statusCode, responseText, response) {
  sendHeaders(statusCode, response);
  response.end(responseText);
};

var sendHeaders = function(statusCode, response) {
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = "application/json";
  response.writeHead(statusCode, headers);
};

var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

module.exports = {handleRequest: handleRequest};
