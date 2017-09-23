require('dotenv').config({silent : true})
const Untappd = require('untappd-js');
const mongoose = require('mongoose');
const path = require('path');
const { User, Checkin, Beer } = require('./models');

mongoose.Promise = require('bluebird');
const { NODE_ENV, MONGO_URL } = process.env;

/**
 * Something akin to a maybe Monad.  Dereference the object
 * according to the supplied path.  If the object turns out
 * to be null at any point, then short circuit and return null
 * @param  {Object} obj - The object to dereference
 * @param  {Array<String>} path - Path of successive derferences
 * @return {any} - null or the dereferenced value
 */
function deref(obj, path){
	for(const k of path){
		obj = obj[k] || {};
	}
	return obj;
}

class FeedProc{
	constructor(username, accessToken){
		this.username = username;
		this.accessToken = accessToken;
		this.waitTime = 16000; // milliseconds
		this.tokens = [];
		this.lastID = 0;
		this.untappd = new Untappd(accessToken);
	}

	fail(err){
		console.log(err);
		// Recycle the current access token
		this.tokens.push(this.untappd.getAccessToken());
    this.untappd.setAccessToken(this.tokens.shift());
    console.log(`${this.username} will try again in ${this.waitTime} milliseconds`);
    setTimeout(this.iter.bind(this), this.waitTime);
	}

	/**
	 * Get the beer info for a given `bid`
	 * @param  {Number} bid - Beer ID
	 * @return {void}
	 */
	fetchBeer(bid){
		return this.untappd.beerInfo({ BID : bid })
			.then(({ response }) => {
				const newData = {
					num_checkins : response.beer.stats.total_count,
					brewery_id : response.beer.brewery.brewery_id,
					rating : response.beer.rating_score,
					style : response.beer.beer_style,
					last_updated : new Date(),
					name : response.beer.beer_name,
					twitter : (response.beer.brewery.contact || {}).twitter,
					brewery_url : (response.beer.brewery.contact || {}).url,
					bid : bid,
					pic : response.beer.beer_label,
					ibus : response.beer.beer_ibu,
					brewery : response.beer.brewery.brewery_name,
					facebook : response.beer.brewery.contact.facebook,
					abv : response.beer.beer_abv,
					brewery_slug : response.beer.brewery.brewery_slug,
					slug : response.beer.beer_slug
				}
				return Beer.findOneAndUpdate({ bid }, newData, { upsert : true })
					.catch(err => {
						const x = newData;
						debugger;
						console.log(err);
					})
			})
			.catch(this.fail.bind(this))
	}

	/**
	 * Process a single checkin We first lookup the beer in our beers 
   * collection.  If it exists, then we look at when it was last updated.
   * If it has been updated in the last week, we simply insert the 
   * checkin into the checkins collection.  If it is stale, then we make a 
   * call to the beer/info endpoint and update the rating and last updated
   * fields of the existing row.  If it wasn't found at all, then we also
   * insert rows into the breweries and venues tables.
	 * @param  {Object} checkin - Untappd checkin object
	 * @return {void}
	 */
	processCheckin(checkin){
		const venue_url = deref(checkin, ['venue', 'contact', 'venue_url']);
		if(venue_url == null || venue_url === ''){// probably a private residence
        console.log('Skipping due to no url')
        return;
    }
    const bid = deref(checkin, ['beer', 'bid']);
    return Beer.findOne({ bid })
    	.then(beer => {
    		if(beer){
    			const sevenDaysAgo = new Date().getTime() - (7 * 24 * 60 * 60 * 1000);
    			if(beer.last_updated < sevenDaysAgo && ((beer.num_checkins || 0) < 2500))
    				return this.fetchBeer(bid); // Too old, refresh this beer's info...
    			else
    				return Promise.resolve(beer); // Less than a week old, use this data...
    		}else{
    			return this.fetchBeer(bid); // Beer doesn't exist, go fetch it...
    		}
    	}).then(beerDoc => {
    		if(beerDoc == null){
    			return //Fetching the beer failed, this will queue up another iter...
    		}
    		const checkinData = {
    			checkin_id : checkin.checkin_id,
    			brewery_id : beerDoc.brewery_id,
    			venue_category : checkin.venue.primary_category,
    			venue_id : checkin.venue.venue_id,
    			brewery_name : beerDoc.brewery,
    			brewery_facebook : beerDoc.facebook,
    			venue_verified : checkin.venue.is_verified,
    			brewery_url : beerDoc.brewery_url,
    			lon : checkin.venue.location.lng,
    			bid : beerDoc.bid,
    			checkin_created : new Date(checkin.created_at),
    			venue : checkin.venue.venue_name,
    			venue_url : checkin.venue.contact.venue_url,
    			checkin_username : this.username,
    			lat : checkin.venue.location.lat,
    			brewery_twitter : beerDoc.twitter,
    			brewery_slug : beerDoc.brewery_slug,
    			venue_twitter : checkin.venue.contact.twitter,
    			venue_slug : checkin.venue.venue_slug
    		}
    		return new Checkin(checkinData).save()
    	})
	}

	seq(ps, i){
		if(i == ps.length)
			return Promise.resolve();
		return ps[i]().then(() => this.seq(ps, i+1));
	}

	/**
	 * Perform a single iteration of fetching data from the API
	 * @return {void} - data is inserted in the DB
	 */
	iter(){
		User.findOne({ id : this.username })
			.then(user => this.untappd.pubFeed({
				lat : user.lat, 
				lng : user.lon, 
				radius : 25,
				min_id : this.lastID
			}))
			.then(({meta, response}) => {
				this.lastID = response.pagination.max_id || this.lastID;
				// return this.seq(response.checkins.items.map(c => () => this.processCheckin(c)), 0);
				return Promise.all(response.checkins.items.map(this.processCheckin.bind(this)))
			})
			.then(checkins => {
				if(checkins.length > 12){
					this.waitTime = Math.max(this.waitTime / 2, 4000);
				}else if(checkins.length <= 2 && this.waitTime < 1800000){
					this.waitTime *= 2;
				}
				console.log(`Stats for ${this.username}:
          Inserted: ${checkins.length} items
          Last ID: ${this.lastID}
          Sleeping: ${this.waitTime} milliseconds
				`)
				setTimeout(this.iter.bind(this), this.waitTime);
			})
			.catch(this.fail.bind(this))
	}

	/**
	 * Get general purpose access tokens
	 * @return {void} - sets the `tokens` field on `this`
	 */
	setTokens(){
		return User.find({ general_purpose : true })
			.then(users => {
				this.tokens = users.map(u => u.access_token);
			});
	}

	/**
	 * Set the last `checkin_id` on `this`.  Pulling from the 
	 * Unappd api will start with respect to this ID.
	 * @returns { void } - sets the `lastID` field on `this`
	 */
	setLastID(){
		return Checkin
			.findOne({ checkin_username : this.username })
			.sort({ checkin_id : -1 })
			.then(result => {
				this.lastID = (result || { checkin_id : 0 }).checkin_id;
			})
	}

	/**
	 * Start the thread
	 */
	start(){
		this.setTokens()
			.then(this.setLastID.bind(this))
			.then(this.iter.bind(this))
	}
}

/**
 * Start all feed processes
 * @return {void}
 */
function startAll(){
	User.findOne({general_purpose : false})
		.then(users => {
			[users].forEach(user => {
				new FeedProc(user.id, user.access_token).start()
			})
		})
}

module.exports = {
	FeedProc,
	startAll
}

if(require.main === module){
	mongoose.connect(MONGO_URL || 'mongodb://localhost/beerfeed', { 
		useMongoClient : true 
	})
	startAll()
}