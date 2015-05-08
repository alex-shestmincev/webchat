var Log = require('lib/log')(module);
var config = require('config');
var connect = require('connect');
var async = require('async');
var cookie = require('cookie');
var sessionStore = require('lib/sessionStore');
var HttpError = require('error').HttpError;
var User = require('models/user').User;
var cookieParser = require('cookie-parser');

function LoadSession(sid,callback){
  sessionStore.load(sid, function(err,session){
    if(arguments.length === 0){
      //no arguments => no session
      return callback(null,null);
    } else {
      return callback(null, session);
    }
  });
}

function LoadUser(session, callback){
  if (!session || !session.user){
    Log.debug("Session %s is anonymous",session.id);
    return callback(null,null);
  }

  Log.debug("retrieving user ", session.user);

  User.findById(session.user, function(err, user){
    if (err) return callback(err);

    if (!user){
      return callback(null,null);
    }
    Log.debug("user findById result: " + user);
    callback(null, user);
  });
}

module.exports = function(server){
  var io = require('socket.io')(server);
  io.set('origins', 'localhost:*');
  io.set('logger', Log);

  var disconnectRoom = function (name) {
    name = '/' + name;

    var users = io.manager.rooms[name];

    for (var i = 0; i < users.length; i++) {
      io.sockets.socket(users[i]).disconnect();
    }

    return this;
  };

  
  io.set('authorization', function(handshake, callback){
    async.waterfall([
        function(callback){
          handshake.cookies = cookie.parse(handshake.headers.cookie || '');
          var sidCookie = handshake.cookies[config.get('session:key')];
          var sid = cookieParser.signedCookie(sidCookie, config.get('session:secret'));

          LoadSession(sid, callback);
        },
        function(session, callback){

          if(!session){
            Log.debug("No session");
            return callback(new HttpError(401, "No session"));
          }

          handshake.session = session;
          LoadUser(session, callback);
        },
        function(user, callback){
          if(!user){
            Log.debug("No user");
            callback(new HttpError(403, "Anonymos session may no connect"));
          }
          handshake.user = user;
          callback(null);
        }
      ], function(err){
        if (!err){
          return callback(null, true);
        }

        if (err instanceof HttpError){
          return callback(null,false);
        }

        callback(err);
      }
    );
  });

  io.sockets.on('connection', function (socket) {
    if (!socket.request.user){return;}

    var username = socket.request.user.get('username');
    socket.broadcast.emit('join', username);

    socket.on('message', function(text, cb){ // cb - callback, который вернется клиенту

      socket.broadcast.emit('message',username, text);
      cb && cb();
    });

    socket.on('disconnect', function(){
      socket.broadcast.emit('leave', username);
    });
  });

  return io;
};
