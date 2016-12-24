const cluster = require('cluster'),
      stopSignals = [
        'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
        'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
      ],
      production = process.env.NODE_ENV == 'production';
const pg = require('pg')
const TwitterBot = require('./twitter-bot').TwitterBot
var feedProc = require('./feed_proc');

const DEBUG = process.env.NODE_ENV === 'debug'


var db = new pg.Client(DEBUG ? {database : 'beerfeed'} : process.env.OPENSHIFT_POSTGRESQL_DB_URL);
db.connect();

var stopping = false;

console.log('Version = ' + process.version)

cluster.on('disconnect', function(worker) {
  if (production) {
    if (!stopping) {
      cluster.fork();
    }
  } else {
    process.exit(1);
  }
});

if (cluster.isMaster) {
  const workerCount = 2; //process.env.NODE_CLUSTER_WORKERS || 3;
  for (var i = 0; i < workerCount; i++) {
    cluster.fork();
  }
  if (production) {
    stopSignals.forEach(function (signal) {
      process.on(signal, function () {
        console.log('Got ${signal}, stopping workers...');
        stopping = true;
        cluster.disconnect(function () {
          console.log('All workers stopped, exiting.');
          process.exit(0);
        });
      });
    });
  }

  db.query('SELECT * FROM users WHERE twitter_secret IS NOT NULL AND twitter_token IS NOT NULL', (err, result) => {
    if(err){
      console.log(err)
    }else{
      result.rows.forEach(row => {
        var bot = new TwitterBot(row.id, row.twitter_token, row.twitter_secret)
        bot.check()
      })
    }
  })

  db.query('SELECT * FROM users WHERE general_purpose=false;', (err, result) => {
    if(err){
      console.log(err)
    }else{
      result.rows.forEach(row => {
        feedProc.startProc({
          username : row.id,
          access_token : row.access_token,
          setTimeoutObj : x => x
        });
      })
    }
  })


} else {
  require('./server.js');
}
