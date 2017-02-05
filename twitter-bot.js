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
		this.tweet = this.tweet.bind(this)
	}

	tweet(beer){
		var url = `http://www.thebeerfeed.com/map/${beer.venue_id}?feed=${this.username}`;
		var loc = beer.twitter || `at ${beer.venue}`
		var status = `${beer.count} people checked in ${beer.brewery}'s ${beer.beer} ${loc}: ${url}`
		status += status.length <= 125 ? ' #beer #untappd' : ''

		if(status.length > 140){
			status = `${beer.count} people checked in ${beer.beer} ${loc}: ${url}`
			if(status.length > 140){
				status = `${beer.count} people checked in ${beer.beer}: ${url}`
			}
		}

		console.log(status)

		this.T.post('statuses/update', {status : status}, (err, data, response) => {
			if(err){
				console.log(err)
			}else{
    			console.log(data)
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

	check(){
		var d = new Date()
		console.log(`Checking top beers at ${d.toLocaleString()}`)

		db.query(`SELECT q.* FROM(
					SELECT 
						beers.name as beer, 
						bid, 
						venue_id, 
						count(*), 
						avg(rating) as rating, 
						max(created) as date, 
						username,
						breweries.name as brewery,
						venues.venue,
						venues.twitter
					FROM checkins NATURAL JOIN beers NATURAL JOIN venues
					LEFT JOIN breweries ON checkins.brewery_id=breweries.brewery_id
					GROUP BY 
						bid, 
						venue_id, 
						username, 
						beers.name,
						breweries.name,
						venues.venue,
						venues.twitter
					HAVING count(*) > 5
				)q LEFT JOIN top_beers ON q.bid=top_beers.bid AND q.venue_id=top_beers.venue_id
				WHERE q.rating > 4.4 AND username='${this.username}' AND top_beers.bid IS NULL;
			`, (err, result) => {
			if(err){
				console.log(err);
			}else{
				result.rows.forEach(this.tweet)
				console.log('Setting timeout for next check')
				setTimeout(this.check.bind(this), 1000 * 60 * 15) //15 minutes
				this.dropOldEntries()
			}
		})
	}
}

exports.TwitterBot = TwitterBot