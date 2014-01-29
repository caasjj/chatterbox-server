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

 var pathnames = ['/classes/rooms', '/classes/messages', '/client'];

 var store = {
  'classes': {
    'room1' : [],
    'room2' : [],
    'messages' : [],
    'rooms': []
  }
};

var handleRequest = function(request, response) {
  var methods = {
    'GET': {
      'resource': getMethod,
      'file': getFile
    },
    'POST': postMethod,
    'OPTIONS': optionsMethod
  };

  console.log( 'URL: ' ,request.url );
  var requestUrl =  url.parse( request.url, true, true ) ;
  var route = requestUrl.pathname;

  if ( !(route.match('/classes/rooms') || route.match('/classes/messages') || route.match('/client')) ) {
    console.log('-- 404 -- on ', route);
    sendResponse(404, '[]', response);
    return;
  }

  if (request.method !== 'GET') {
    methods[request.method](request, response);
  } else {
    if (route.match('/classes')) {
      methods[request.method]['resource'](request, response);
    } else {
      methods[request.method]['file'](request, response);
    }
  }
};

var getFile = function(request, response) {
  var fileName = '..' + url.parse(request.url, true, true ).pathname;
  var resp =  'Load file:' + fileName;
  console.log(resp);
  fs.loadFile(fileName, function(err, data) {
      sendFile(err, data, response, fileName);
    });
};

var sendFile = function(err, data, response, filename) {
  console.log('Got file!');
  if (err) {
    console.log('Got error!!');
    sendResponse(404, '[]', response);
  } else {
    console.log('File data: ', data);
   // sendResponse(200, data, response);
    var headers = defaultCorsHeaders;
    if (filename.match('.css')) {
      headers['Content-Type'] =  "text/css";
    } else {
      headers['Content-Type'] =  "text/html";
    }
    response.writeHead(200, headers);
    response.end(data);
  }
};

var getMethod = function(request, response){
  var requestRoute = parseRoute( request.url );
  var resource = requestRoute['resource'];
  var base = requestRoute['base'];
  var getData = store[ base ][ resource ];

  if (getData.length > 1) {
    sendResponse(200, JSON.stringify( { 'results': getData }), response);
  } else {
    sendResponse(200, JSON.stringify( getData ), response);
  }
  return;
};

//if (request.method === 'POST') {
var postMethod = function(request, response) {
  console.log('--POST--');
    var requestRoute = parseRoute( request.url );
  var resource = requestRoute['resource'];
  var base = requestRoute['base'];
  var postData='';
  request.on('data', function(chunk) {
    postData += chunk;
  });
  request.on('end', function() {
//    if (resource === 'messages') {
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
};

var optionsMethod = function(request, response) {
  sendResponse('200', '', response);
  return;
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

var sendHeaders = function(statusCode, response, content) {
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = content || "application/json";
  response.writeHead(statusCode, headers);
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
