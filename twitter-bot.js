require('dotenv').config({silent : true})
var Twit = require('twit')
var pg = require('pg')
var _ = require('lodash')

var db = new pg.Client(process.env.OPENSHIFT_POSTGRESQL_DB_URL);
db.connect();

var T = new Twit({
	consumer_key : process.env.TWITTER_KEY,
	consumer_secret : process.env.TWITTER_SECRET,
	access_token : process.env.TWITTER_ACCESS_TOKEN,
	access_token_secret : process.env.TWITTER_ACCESS_SECRET
})

function tweet(beer){

	db.query(`
		SELECT * FROM checkins 
			NATURAL JOIN beers NATURAL JOIN venues
		WHERE venue_id=${beer.venue_id} AND bid=${beer.bid};
	`, (err, result) => {
		if(err){
			console.log(err)
		}else{
			var info = result.rows[0]
			var url = `http://www.thebeerfeed.com/#/map/${info.venue_id}`;
			var loc = info.twitter || `at ${info.venue}`
			var status = `${beer.count} people checked in ${info.brewery}'s ${info.name} ${loc}: ${url}`
			T.post('statuses/update', { 
				status: status, 
				lat : info.lat,
				long : info.lon
			}, function(err, data, response) {
			  console.log(data)
			});			
		}
	})
}

function dropOldEntries(){
  db.query('DELETE FROM top_beers WHERE date < NOW() - INTERVAL \'7 days\';')
}

function check(){
	db.query(`SELECT * FROM(
				SELECT beers_.name as beer, bid, venue_id, count(*), avg(rating) as rating, max(created) as date, username
				FROM checkins NATURAL JOIN beers_ NATURAL JOIN venues
				GROUP BY bid, venue_id, username, beers_.name
				HAVING count(*) > 5
			)q WHERE rating > 4.4 AND username='nyc_feed'`, (err, result) => {
		if(err){
			console.log(err);
		}else{
			_.forEach(result.rows, row =>{
				db.query(`
					SELECT * FROM top_beers WHERE bid=${row.bid} AND
						venue_id=${row.venue_id};
				`, (err, result2) => {
					if(err){
						console.log(err)
					}else if(result2.rows.length == 0){
						console.log(`INSERT INTO top_beers(bid, venue_id, count, rating, date) VALUES (${row.bid}, ${row.venue_id}, ${row.count}, ${row.rating}, '${row.date}');`)
						db.query(`
							INSERT INTO top_beers(bid, venue_id, count, rating, date) VALUES 
								(${row.bid}, ${row.venue_id}, ${row.count}, ${row.rating}, '${row.date.toLocaleDateString()}');
						`, err => {
							if(err){
								console.log(err)
							}else{
								console.log('inserted!')
								tweet(row)
							}
						})
					}else{
						console.log(`${row.beer} at ${row.venue_id} was already inserted and now has a count of ${row.count}`)
					}
				})
			})
			setTimeout(check, 1000 * 60 * 1) //30 minutes
			dropOldEntries()
		}
	})
}

check()

module.exports.check = check
