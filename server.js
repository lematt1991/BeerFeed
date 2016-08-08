var express = require('express');
var pg = require('pg');
var cors = require('cors');
var UntappdClient = require('node-untappd');
var request = require('request');
var feedProc = require('./feed_proc');
var util = require('util');
var sched = require('node-schedule');
require('dotenv').config({silent : true})

var untappd = new UntappdClient();

var clientSecret = process.env.UNTAPPD_CLIENT_SECRET;
var clientID = process.env.UNTAPPD_CLIENT_ID;

untappd.setClientId(clientID);
untappd.setClientSecret(clientSecret);

var app = express();

app.use(cors());

var db = new pg.Client(process.env.OPENSHIFT_POSTGRESQL_DB_URL);
db.connect();

var procs = [];

//var redirectURL = 'https://untappd-feed-filter.herokuapp.com/AuthRedirect'
var redirectURL = 'http://beerfeed-ml9951.rhcloud.com/AuthRedirect'

app.use(express.static('static/src'));

app.get('/health', function(req, res){
  res.send({})
})

app.get('/Auth', function(req, res){
    var url = util.format('https://untappd.com/oauth/authenticate/?client_id=%s&client_secret=%s&response_type=code&redirect_url=%s',
                          clientID, clientSecret, redirectURL);
    console.log('redirecting to ' + url)
    res.redirect(url);
});

app.get('/AuthRedirect', function(req, res){
  var url = util.format('https://untappd.com/oauth/authorize/?client_id=%s&client_secret=%s&response_type=code&redirect_url=%s&code=%s',
                        clientID, clientSecret, redirectURL, req.query.code);
  console.log('requesting ' + url)
  request(url, function(err, response, body){
    if(!err){
      token = JSON.parse(body).response.access_token;
      if(token === undefined){
        console.log(body);
        return;
      }
      console.log('token = ' + token)
  	  untappd.setAccessToken(token);
  	  untappd.userInfo(function(err, data){
        if(err){
          console.log(err);
        }
        
        console.log(data)

        if(data.meta.error_type === 'invalid_limit'){
          res.send('Access limit exceeded for API key')
          return
        }
        
    	  var username = data.response.user.user_name;
        
        console.log('inserting ' + username)

        var q = util.format('INSERT INTO users (id, access_token, lat, lon, general_purpose, last_id)' + 
                            ' SELECT $$%s$$, $$%s$$, 0.0, 0.0, true, 0 WHERE NOT ' + 
                            'EXISTS(SELECT 1 FROM users WHERE id=$$%s$$);', username, token, username)
    	  db.query(q, function(err, result){
          res.redirect('http://beerfeed-ml9951.rhcloud.com/#/feed?thanks=true')
    		});
  	  });
    }else{
      console.log(err);
    }
  });
});

//Post location coordinates, should also contain a username
app.get('/Loc', function(req, res){
  var lat = req.query.lat;
  var lon = req.query.lon;
  var username = req.query.username;

  var query = 'UPDATE users SET lat=' + lat + ', lon=' + lon + ' WHERE id=\'' + username + '\' RETURNING *;'
  console.log(query)
  db.query(query, function(err, result){
  	if(result.rowCount === 0){
      console.log('User not found in database');
  	}
  	res.send(req.body);
  });
});

//Get top beers for a particular user
app.get('/Beers/:user', function(req, res){
  var lastID = req.query.lastID ? req.query.lastID : 0;
  var username = req.params.user;
  var query = util.format('SELECT * FROM beers WHERE username = $$%s$$ AND ' + 
                          'checkin_id > %d ORDER BY venue', username, lastID)
  db.query(query, function(err, result){
    var jsonRes = [];
    var mapping = {};
    var latest = 0
    for(var i = 0; i < result.rows.length; i++){
      var row = result.rows[i];
      if(row.checkin_id > latest)
        latest = row.checkin_id;
      if(mapping[row.venue] === undefined){
        jsonRes.push({
          coordinate : {latitude : row.lat, longitude : row.lon}, venue : row.venue,
          beers : [{name : row.name, brewery : row.brewery, rating : row.rating}]
        });
        mapping[row.venue] = jsonRes.length;
      }else{
        jsonRes[mapping[row.venue]-1].beers.push({name : row.name, brewery : row.brewery,
                                       rating : row.rating});
      }
    }    
    res.send({lastID : latest, venues : jsonRes});
  })
});

app.get('/Feed', function(req, res){
  var lastID = req.query.lastID ? req.query.lastID : 0;
  var userPred = req.query.user ? ('AND username=$$' + req.query.user + '$$') : ''
  query = util.format('SELECT * FROM beers WHERE checkin_id > %d ' + userPred + 
                      ' ORDER BY checkin_id DESC;', lastID)
  db.query(query, function(err, result){
    if(result.rows.length > 0){
      res.send({checkins : result.rows, lastID : result.rows[0].checkin_id})
    }else{
      res.send({})
    }
  });
});

app.get('/Start/:user', function(req, resp){
  db.query('SELECT id, access_token FROM users WHERE id=$$' + req.params.user + '$$;').then(
    function(res){
      for(var i = 0; i < res.rows.length; i++){
        var username = res.rows[i].id;

        feedProc.startProc({
          username : username,
          access_token : res.rows[i].access_token,
          setTimeoutObj : function(obj){procs[username] = obj;}
        });
        console.log('Starting ' + username)
      }
      resp.send({})
    }
  ).catch(function(err){
    console.log(err)
  });
});


function dropOldEntries(){
  db.query('DELETE FROM beers WHERE created < NOW() - INTERVAL \'2 days\';')
}

var rule = new sched.RecurrenceRule();
rule.hour = 0;
rule.minute = 0;

sched.scheduleJob(rule, dropOldEntries);

process.on('exit', function() {
    console.log('About to close');
});

port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8082;
ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";


var server = app.listen(port, ip, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("Beer feed listening at http://%s:%s", host, port)

})

setInterval(function(){request('https://untappd-feed-filter.herokuapp.com/Wakeup');}, 1000000);  //send every 16 minutes

app.get('/Wakeup', function(req, res){
  console.log('handling wakeup')
  res.send('')
});

