var ChatterView = function(model) {
  // displays
  this._model = model;
  this._model._view = this;
  this._chatDisplay = Handlebars.compile( $('#chats').html() );
  this._usersDisplay=Handlebars.compile( $('#users').html() );
  this._roomsDisplay=Handlebars.compile( $('#rooms').html() );

  $('.chat-users').on('click', _.bind( function(e) {
    console.log('clicked on ', $(e.target).text() );
    this._model.updateFollowList( $(e.target).text() );
  }, this) );

  $('#type-chat').on('keyup', _.bind( function(e) {
     if (e.keyCode === 13) {
       this._model.sendMessage( $(e.target).val() );
       $(e.target).val('');
     }
  }, this));

  $('.chat-rooms').on('click', _.bind( function(e) {
    console.log('clicked on ', $(e.target).text() );
    this._model.updateRoom( $(e.target).text() );
  }, this) );
};

ChatterView.prototype.dataEvent = function() {
  console.log('View got updated Data!');
  this.render();
};

ChatterView.prototype.render = function() {
  //var html = this._chatDisplay( this._model._messageList._messages );
  var html = this._chatDisplay( this._model.getRoomMessages() );
  $('.chat-display').html(html);

  html = this._usersDisplay( this._model._onlineUsers );
  $('.chat-users').html(html);

  html = this._roomsDisplay( this._model._roomsList );
  $('.chat-rooms').html(html);
};