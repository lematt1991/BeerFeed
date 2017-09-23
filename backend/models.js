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
	slug : String
});

const Checkin = new mongoose.Schema({
	brewery_id : Number,
	username : String,
	venue_id : Number,
	created : Date,
	bid : Number,
	checkin_id : Number
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

const Venue = new mongoose.Schema({
	category : String,
	venue_id : Number,
	verified : Boolean,
	url : String,
	twitter : String,
	venue : String,
	geom : String,
	venue_slug : String
});

module.exports = {
	Beer : mongoose.model('beers', Beer),
	Checkin : mongoose.model('checkins', Checkin),
	TopBeer : mongoose.model('top_beers', TopBeer),
	User : mongoose.model('users', User),
	Venue : mongoose.model('venues', Venue)
}