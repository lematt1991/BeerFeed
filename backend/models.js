const mongoose = require('mongoose');

const Beer = new mongoose.Schema({
	brewery_id : Number,
	rating : Number,
	style : String,
	last_updated : Date,
	name : String,
	twitter : String,
	brewery_url : String,
	bid : Number,
	pic : String,
	ibus : Number,
	brewery : String,
	facebook : String,
	abv : Number,
	brewery_slug : String,
	slug : String,
	num_checkins : Number,
});

const Checkin = new mongoose.Schema({
	brewery_id : Number,
	venue_category : String,
	venue_id : Number,
	brewery_name : String,
	brewery_facebook : String,
	venue_verified : Boolean,
	brewery_url : String,
	lon : Number,
	bid : Number,
	checkin_created : Date,
	venue : String,
	checkin_id : Number,
	venue_url : String,
	checkin_username : String,
	lat : Number,
	brewery_twitter : String,
	brewery_slug : String,
	venue_twitter : String,
	venue_slug : String
});

const TopBeer = new mongoose.Schema({
	count : Number,
	rating : Number,
	venue_id : Number,
	bid : Number,
	date : Date
});

const User = new mongoose.Schema({
	city : String,
	twitter_token : String,
	general_purpose : Boolean,
	access_token : String,
	lat : Number,
	lon : Number,
	twitter_secret : String,
	twitter_handle : String,
	id : String,
	last_id : Number
});

module.exports = {
	Beer : mongoose.model('beers', Beer),
	Checkin : mongoose.model('checkins', Checkin),
	TopBeer : mongoose.model('top_beers', TopBeer),
	User : mongoose.model('users', User),
}