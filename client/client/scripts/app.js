// YOUR CODE HERE:
var Chatterbox = function() {
 // private data
  var timer          = null;

  // parameters
  this._username      = window.location.search.slice( window.location.search.search('=')+1 );
  this._roomsList     = [];
  this._roomJoined    = [];
  this._onlineUsers   = [];
  this._followList   = [];
  this._messageList   = new MessageList(50);

  // public data
  // this._chatterboxUrl = "https://api.parse.com/1/classes/chatterbox";
  this._chatterboxUrl = "http://localhost:8080";

  // displays
  // this._chatDisplay = Handlebars.compile( $('#chats').html() );
  // this._usersDisplay=Handlebars.compile( $('#users').html() );

  // Class methods
  Chatterbox.start = function(func, context) {
    timer = setInterval(_.bind(func, context), 2000);
  };

  Chatterbox.stop = function() {
    clearInterval( timer );
  };

};

// private methods
Chatterbox.prototype._transmit = function(message) {
  return $.ajax({
    url: this._chatterboxUrl,
    type: 'POST',
    data: message.json(),
    contentType: 'application/json'
  });
};

Chatterbox.prototype._transmitError = function(xhr, ajaxOptions, thrownError) {
  console.error('Message transmission failed!');
};

Chatterbox.prototype._transmitSuccess = function(response) {
  console.log("Message transmitted successfully: ", response);
  this.fetchMessages();
};

Chatterbox.prototype._receiveError = function(jqXhr, status) {
  // if (jqXhr) {
    console.error('Error while receiving messages: ', jqXhr.statusText, 'code: ', jqXhr.status );
  // }
};

Chatterbox.prototype._fetch = function(objectId) {
  var url = this._chatterboxUrl + (objectId ? '/' + objectId : '');
  url = url; //+ '?order=-createdAt';
  console.log('fetch url ', url);
  return $.ajax({
    url: url,
    type: 'GET',
    limit: 500,
    contentType: 'application/json'
  });
};

Chatterbox.prototype._parseReceiveMessage = function(data, ajaxOptions, thrownError) {
  if (data.hasOwnProperty('results')) {
    this._messageList.addMessages( data.results );
  } else {
    this._messageList.addMessages( [data] );
  }

  //this._updateUserList();
  this._updateList(this._onlineUsers, 'username');
  this._updateList(this._roomsList, 'roomname');

  if (typeof this._view === 'object') {
    this._view.dataEvent();
  }
  console.log('Got new list of messages');
};

// public API
Chatterbox.prototype.sendMessage = function(message) {
  var that = this;
  message = {
    text: message,
    username: this._username,
    roomname: null
  };
  this
  ._transmit(new Message(message))
  .done(function() { that._transmitSuccess(); } )
  .fail(function() { that._transmitError(); } )
  .always(function() {
    console.log('Message transmission complete');
  });
};

Chatterbox.prototype.fetchMessages = function(objectId) {
  var that = this;
  this
  ._fetch(objectId)
  .done( _.bind( this._parseReceiveMessage, this)  )
  .fail( _.bind( this._receiveError, this) )
  .always( function() {
    console.log('fetchMessages ajax call done');
  });
};

Chatterbox.prototype.getRoomMessages = function() {
  return this._messageList.filter( {rooms: this._roomJoined} );
};

Chatterbox.prototype.createRoom = function(roomname) {

};

Chatterbox.prototype.updateRoom = function(roomname) {
  if (this._roomJoined.indexOf(roomname) > -1) {
    this._roomJoined = _.without( this._roomJoined, roomname);
  } else {
    this._roomJoined.push( roomname );
  }
  console.log( this._roomJoined);
};

Chatterbox.prototype.updateFollowList = function(username) {
  if (this._followList.indexOf(username) > -1) {
    this._followList = _.without( this._followList, username);
  } else {
    this._followList.push( username );
  }
  console.log( this._followList );
};

Chatterbox.prototype.removeFromFollowList = function(username) {

};

Chatterbox.prototype._updateUserList = function() {
  var onlineUser = {};
  var notInList = function(user) {
    return user.username !== onlineUser.username; 
  };
  var userList = this._onlineUsers;
  for(var i=0; i < this._messageList._messages.length; i++) {
    onlineUser.username = this._messageList._messages[i].username;
    if (_.every(userList, notInList)) {
      this._onlineUsers.push({'username' : onlineUser.username});
    }
  }
};

Chatterbox.prototype._updateList = function(list, itemName) {
  var currentItem, dummyObj ;
  var notInList = function(item) {
    return item[itemName] !== currentItem; 
  };
  for(var i=0; i < this._messageList._messages.length; i++) {
    currentItem = this._messageList._messages[i][itemName];
    if (_.every(list, notInList)) {
      dummyObj ={};
      dummyObj[itemName] = currentItem;
      list.push(dummyObj);
    }
  }
};

Chatterbox.prototype._updateRoomsList  = function() {
  var rooms = {};
};

var chatterbox = new Chatterbox();
var chatterView = new ChatterView( chatterbox );
Chatterbox.start( chatterbox.fetchMessages, chatterbox );