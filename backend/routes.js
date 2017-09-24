const express = require('express');
const { Beer, Checkin, User, Venue } = require('./models');
const axios = require('axios');

const router = express.Router();

const REDIRECT_URL = 'http://localhost:3001/AuthRedirect';

module.exports = function(untappd){
	/**
	 * Get the feed for a particular location
	 * @param { string } user - The feed to fetch for
	 * @param { number } [last_id] - offset to start fetching from (optional)
	 * @return { Array<Object> } - The feed
	 */
	router.get('/Feed/:user/:last_id?', (req, res) => {
		Checkin.aggregate([
			{ 
				$match : {
					$and : [
						{ checkin_username : req.params.user },
						{ checkin_id : { $gt : +req.params.last_id || 0 } }
					]
				}
			},
			{
				$group : {
					_id : { venue_id : "$venue_id", bid : "$bid" },
					checkin_id : { $max : '$checkin_id'},
					name : { $first : '$beer_name' },
					bid : { $first : '$bid' },
					lat : { $first : '$lat' },
					lon : { $first : '$lon' },
					venue : { $first : '$venue' },
					brewery : { $first : '$brewery_name' },
					venue_id : { $first : '$venue_id' },
					created : { $max : '$checkin_created' },
					checkin_count : { $sum : 1 }
				}
			},
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
					"beer.twitter" : 0,
					"beer.brewery_url" : 0,
					"beer.bid" : 0,
					"beer.brewery" : 0,
					"beer.facebook" : 0,
					"beer.brewery_slug" : 0,
				}
			},
			{ $match : { "beer.rating" : { $gte : 4.0 } } },
			{ $sort : { checkin_id : -1 } }
		])
		.then(result => {
			if(result.length > 0){
				res.json({
					lastID : result[0].checkin_id,
					checkins : result
				})
			}else{
				res.json({
					lastID : req.params.last_id || 0,
					checkins : []
				})
			}
		})
		.catch(err => res.status(500).send(err))
	});

	/**
	 * Fetch all available feeds from the server
	 * @return {Array<Object>} - Returns all available feeds
	 */
	router.get('/Feeds', function(req, res){
		User.find({general_purpose : false})
			.then(result => res.json(result))
			.catch(err => err.status(500).send(err))
	})

	/**
	 * Authenticate a user
	 * This will redirect the user to Untappd and have them login.
	 * After signing in to their account, they will be send to the
	 * `AuthRedirect` route which will contain the user's access_token
	 */
	router.get('/Auth', function(req, res){
	  const base = 'https://untappd.com/oauth/authenticate'
	  const params = {
			client_id : process.env.UNTAPPD_CLIENT_ID,
			client_secret : process.env.UNTAPPD_CLIENT_SECRET,
			response_type : 'code',
			redirect_url : REDIRECT_URL
		}
	  const url = `${base}?${Object.keys(params).map(k => `${k}=${params[k]}`).join('&')}`;
	  res.redirect(url);
	});

	/**
	 * Second phase of user authentication
	 * Add the user to the database.
	 */
	router.get('/AuthRedirect', function(req, res){
		axios.request({
			url : 'https://untappd.com/oauth/authorize',
			params : {
				client_id : process.env.UNTAPPD_CLIENT_ID,
				client_secret : process.env.UNTAPPD_CLIENT_SECRET,
				response_type : 'code',
				redirect_url : REDIRECT_URL,
				code : req.query.code
			}
		}).then(({data}) => {
			untappd.setAccessToken(data.response.access_token);
			untappd.userInfo()
				.then(data => {
					const query = { id : data.response.user.user_name };
					const userData = {
						id : data.response.user.user_name,
						access_token : data.response.access_token,
						general_purpose : true
					};
					User.findOneAndUpdate(query, userData, { upsert : true })
						.then(() => res.send())
						.catch(err => res.status(500).send(err))
				})
				.catch(err => res.status(500).send(err))
		}).catch(err => res.status(500).send(err))
	});

	return router;	
}
