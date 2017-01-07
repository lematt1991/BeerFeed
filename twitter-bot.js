require('dotenv').config({silent : true})
var Twit = require('twit')
var pg = require('pg')
var _ = require('lodash')
var request = require('request').defaults({ encoding: null });

var db = new pg.Client(process.env.OPENSHIFT_POSTGRESQL_DB_URL);
db.connect();

class TwitterBot{
	dropOldEntries(){
	  db.query('DELETE FROM top_beers WHERE date < NOW() - INTERVAL \'7 days\';')
	}

	constructor(username, token, token_secret){
		this.T = new Twit({
			consumer_key : process.env.TWITTER_KEY,
			consumer_secret : process.env.TWITTER_SECRET,
			access_token : token,
			access_token_secret : token_secret
		});
		this.username = username;
	}

	tweet(beer){
		var q = `
			SELECT beers.bid, 
				   venues.venue_id as venue_id, 
				   beers.name as name, 
				   breweries.name as brewery ,
				   beers.pic,
				   venues.venue,
				   venues.twitter
			FROM checkins 
				NATURAL JOIN beers NATURAL JOIN venues 
				LEFT JOIN breweries on breweries.brewery_id=checkins.brewery_id
			WHERE venues.venue_id=${beer.venue_id} AND beers.bid=${beer.bid};
		`
		console.log(q)
		db.query(q, (err, result) => {
			if(err){
				console.log(err)
			}else{
				var info = result.rows[0]
				var url = `http://www.thebeerfeed.com/#/map/${info.venue_id}`;
				var loc = info.twitter || `at ${info.venue}`
				var status = `${beer.count} people checked in ${info.brewery}'s ${info.name} ${loc}: ${url}`
				status += status.length <= 125 ? ' #beer #untappd' : ''
				console.log(status)
				this.T.post('statuses/update', {status : status}, (err3, data3, response3) => {
	    			if(err3){
	    				console.log(err3)
	    			}else{
	        			console.log(data3)
	        			console.log('Success!')
						var q = `INSERT INTO top_beers(bid, venue_id, count, rating, date) VALUES (${beer.bid}, ${beer.venue_id}, ${beer.count}, ${beer.rating}, '${beer.date.toISOString()}');`
						console.log(q)
						db.query(q)
							.then(console.log('inserted!'))
							.catch(err => {
								console.log(err)
							})
	        		}
	    		})
			}
		})
	}
	check(){
		var d = new Date()
		console.log(`Checking top beers at ${d.toLocaleString()}`)

		db.query(`SELECT * FROM(
					SELECT beers.name as beer, bid, venue_id, count(*), avg(rating) as rating, max(created) as date, username
					FROM checkins NATURAL JOIN beers NATURAL JOIN venues
					GROUP BY bid, venue_id, username, beers.name
					HAVING count(*) > 5
				)q WHERE rating > 4.4 AND username='${this.username}'`, (err, result) => {
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
							this.tweet(row)
						}else{
							console.log(`${row.beer} at ${row.venue_id} was already inserted and now has a count of ${row.count}`)
						}
					})
				})
				console.log('Setting timeout for next check')
				setTimeout(this.check.bind(this), 1000 * 60 * 15) //15 minutes
				this.dropOldEntries()
			}
		})
	}
}

exports.TwitterBot = TwitterBot