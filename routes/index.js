module.exports = function Route(app){
  app.get('/', function(req, res){
    res.render('index', {title: 'RTT', session_id: req.sessionID});
  });

  users = [];

  app.io.route('got_a_new_user', function(req){
    // console.log('REQ::::', req);

    var USER = function(name) {
      this.name = name;
      this.id = undefined;
    }

    user = new USER(req.data.name);

    user.id = req.sessionID;

    // console.log('#########request#######',req);

    req.io.emit('existing_users', users); // shows existing users to new user excluding self

    req.io.emit('show_self', user); // shows new user to themself w/ textarea

    users.push(user); // add new user to users array

    req.io.broadcast('new_user', user); // shows new user to all existing users

    req.session.save();
  })

  app.io.route('disconnect', function(req){

    for(var i=0; i < users.length; i++ ) // removes disconnected user from databasen
    {
      if(users[i].id === req.sessionID)
      {
        users.splice(i, 1);
      }
    }
    // console.log('##########Disconnected#########', req);
    req.io.broadcast('disconnect_user', req.sessionID )
  });

  app.io.route('updated_text', function(req){
    var message = req.data.message;
    var id = req.data.id;
    var msg = {message: message, id:id};
    req.io.broadcast('show_message', msg);
  })
}
