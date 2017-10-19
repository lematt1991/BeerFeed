require('dotenv').config({silent : true})
var Twit = require('twit')
const { Checkin, User, TopBeer } = require('./models');

class TwitterBot{
	dropOldEntries(){
		const twoDays = new Date(new Date() - 1000 * 60 * 60 * 24 * 2);
		TopBeer.find({ date : { $lt : twoDays } })
			.remove((err, result) => {
				if(err){
					console.log(err)
				}else{
					console.log('Success!')
				}
			})
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
		var url = `http://www.thebeerfeed.com/map?feed=${this.username}&venue=${beer.venue_id}`;
		var loc = beer.beer.twitter || `at ${beer.venue}`
		var status = `${beer.checkin_count} people checked in ${beer.brewery}'s ${beer.beer.name} ${loc}: ${url}`
		status += status.length <= 125 ? ' #beer #untappd' : ''

		if(status.length > 140){
			status = `${beer.checkin_count} people checked in ${beer.beer.name} ${loc}: ${url}`
			if(status.length > 140){
				status = `${beer.checkin_count} people checked in ${beer.beer.name}: ${url}`
			}
		}

		return this.T.post('statuses/update', {status : status})
			.then(data => new TopBeer({
					count : beer.checkin_count,
					rating : beer.beer.rating,
					venue_id : beer.venue_id,
					bid : beer.bid,
					date : new Date()
				}).save()
			)
			.catch(err => {
				console.log(err)
  		})
	}

	check(){
		var d = new Date()
		console.log(`Checking top beers at ${d.toLocaleString()}`)
		const twoDays = new Date(new Date() - 1000 * 60 * 60 * 24 * 2);
		Checkin.aggregate([
			{ 
				$match : {
					$and : [
						{ checkin_username : this.username },
						{ venue_category : { $ne : 'Travel & Transport'} },
						{ venue_category : { $ne : 'Outdoors & Recreation' } },
						{ venue_url : { $ne : null } },
						{ checkin_created : { $gte : twoDays } }
					]
				}
			},
			{
				$group : {
					_id : { venue_id : "$venue_id", bid : "$bid" },
					venue : { $first : '$venue' },
					brewery : { $first : '$brewery_name' },
					venue_id : { $first : '$venue_id' },
					bid : { $first : '$bid' },
					checkin_count : { $sum : 1 }
				}
			},
			{ $match : { checkin_count : { $gte : 5 } } },
			{
				$lookup : {
					from : 'beers',
					localField : 'bid',
					foreignField : 'bid',
					as : 'beer'
				}
			},
			{ $unwind : '$beer' },
			{
				$project : {
					"beer._id" : 0,
					"beer.brewery_id" : 0,
					"beer.last_updated" : 0,
					"beer.brewery_url" : 0,
					"beer.bid" : 0,
					"beer.brewery" : 0,
					"beer.facebook" : 0,
					"beer.brewery_slug" : 0,
					"beer.style" : 0,
					"beer.pic" : 0,
					"beer.ibus" : 0
				}
			},
			{ $match : { "beer.rating" : { $gte : 4.0 } } }
		])
		.then(result => {
			result.forEach(tb => {
				if(this.topBeers[tb.venue_id] == null || this.topBeers[tb.venue_id][tb.bid] == null){
					var venue = this.topBeers[tb.venue_id] || {};
					venue[tb.bid] = true;
					this.topBeers[tb.venue_id] = venue;
					return this.tweet(tb);
				}
			});
			setTimeout(this.check.bind(this), 1000 * 60 * 15);
			this.dropOldEntries()
		}).catch(err => {
			console.log(err)
		})
	}

	start(){
		TopBeer.find({})
			.then(topBeers => {
				this.topBeers = {};
				topBeers.forEach(tb => {
					var venue = this.topBeers[tb.venue_id] || {};
					venue[tb.bid] = true
					this.topBeers[tb.venue_id] = venue;
				})
			})
			.then(this.check.bind(this))
			.catch(err => {
				console.log(err)
			})
	}

}

// const mongoose = require('mongoose');
// mongoose.Promise = require('bluebird');
// const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost/beerfeed';
// mongoose.connect(MONGO_URL, { useMongoClient : true })

function startAll(){
	User.find({twitter_handle : { $ne : null } })
		.then(users => {
			users.forEach(user => {
				new TwitterBot(user.id, user.twitter_token, user.twitter_secret).start()				
			})
		})
		.catch(err => console.log(err))
}

module.exports = {
	TwitterBot : TwitterBot,
	startAll : startAll
};
