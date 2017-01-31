var express = require('express');
var pg = require('pg');
var UntappdClient = require('node-untappd');
var request = require('request');
var feedProc = require('./feed_proc');
var sched = require('node-schedule');
var cluster = require('cluster')
require('dotenv').config({silent : true})

const DEBUG = process.env.NODE_ENV === 'debug'

var untappd = new UntappdClient();

var clientSecret = process.env.UNTAPPD_CLIENT_SECRET;
var clientID = process.env.UNTAPPD_CLIENT_ID;

untappd.setClientId(clientID);
untappd.setClientSecret(clientSecret);

var app = express();

var db = new pg.Client(process.env.OPENSHIFT_POSTGRESQL_DB_URL);
db.connect();

var redirectURL = 'http://beerfeed-ml9951.rhcloud.com/AuthRedirect'

if(DEBUG){
  var config = require('./webpack.config')
  var webpack = require('webpack')

  config.plugins.push(new webpack.DefinePlugin({
    'process.env' : {'NODE_ENV' : JSON.stringify('debug')}
  }))

  var compiler = webpack(config)
  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true, publicPath: config.output.publicPath
  }))

  app.use(require('webpack-hot-middleware')(compiler, {
    log: console.log,
    path: '/__webpack_hmr',
    heartbeat: 10 * 1000
  }))
}

app.use(express.static('static/src'));

app.get('/health', function(req, res){
  res.send({})
})

app.get('/Auth', function(req, res){
  const base = 'https://untappd.com/oauth/authenticate'
  const url = `${base}?client_id=${clientID}&client_secret=${clientSecret}&response_type=code&redirect_url=${redirectURL}`
  res.redirect(url);
});

app.get('/AuthRedirect', function(req, res){
  var base = 'https://untappd.com/oauth/authorize'
  var url = `${base}?client_id=${clientID}&client_secret=${clientSecret}&response_type=code&redirect_url=${redirectURL}&code=${req.query.code}`
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
        var q = `
          INSERT INTO users(id, access_token, lat, lon, general_purpose, last_id)
          SELECT $$${username}$$, $$${token}$$, 0.0, 0.0, true, 0 
          WHERE NOT EXISTS (SELECT 1 FROM users WHERE id=$$${username}$$)

        `
    	  db.query(q, function(err, result){
          res.redirect('http://beerfeed-ml9951.rhcloud.com/#/feed?thanks=true')
    		});
  	  });
    }else{
      console.log(err);
    }
  });
});

app.get('/Feed', function(req, res){
  var lastID = req.query.lastID ? req.query.lastID : 0;
  var userPred = req.query.user ? ('AND username=$$' + req.query.user + '$$') : ''

  var query = `
      SELECT 
        max(checkins.checkin_id) as checkin_id,
        beers.name as name, 
        venues.venue as venue,
        breweries.name as brewery,
        beers.bid, 
        ST_X(venues.geom) as lon,
        ST_Y(venues.geom) as lat,
        checkins.venue_id, 
        max(beers.rating) as rating,
        beers.slug as beer_slug,
        max(checkins.created) as created,
        beers.pic,
        COUNT(checkins.checkin_id)::int as checkin_count
      FROM checkins 
        NATURAL JOIN beers 
        NATURAL JOIN venues 
        LEFT JOIN breweries ON breweries.brewery_id=checkins.brewery_id
      WHERE rating >= 4.0 AND 
        checkin_id > ${lastID} AND
        venues.category <> 'Travel & Transport' AND
        venues.category <> 'Outdoors & Recreation'
        AND username='${req.query.user}'
      GROUP BY 
        checkins.venue_id, 
        beers.bid,
        beers.name,
        venues.venue,
        breweries.name,
        lon,
        lat,
        beers.slug,
        beers.pic
      ORDER BY checkin_id DESC;
  `
  db.query(query, function(err, result){
    if(err){
      console.log(err)
    }else if(result.rows.length > 0){
      res.send({checkins : result.rows, lastID : result.rows[0].checkin_id})
    }else{
      res.send({})
    }
  });
});

function dropOldEntries(){
  db.query('DELETE FROM checkins WHERE created < NOW() - INTERVAL \'2 days\';')
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

