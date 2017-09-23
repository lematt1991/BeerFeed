const express = require('express');
const { Beer, Checkin, User, Venue } = require('./models');

const router = express.Router();

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
	  const url = `${base}?client_id=${clientID}&client_secret=${clientSecret}&response_type=code&redirect_url=${redirectURL}`
	  res.redirect(url);
	});

	/**
	 * Second phase of user authentication
	 * Add the user to the database.
	 */
	router.get('/AuthRedirect', function(req, res){
	  var base = 'https://untappd.com/oauth/authorize'
	  var url = `${base}?client_id=${clientID}&client_secret=${clientSecret}&response_type=code&redirect_url=${redirectURL}&code=${req.query.code}`
	  request(url, function(err, response, body){
	    if(!err){
	      token = JSON.parse(body).response.access_token;
	      if(token == null){
	      	res.status(500).send('Access token is null!')
	      }
	  	  untappd.setAccessToken(token);
	  	  untappd.userInfo(function(err, data){
	        if(err){
	        	res.status(500).send(err)
	        }else if (data.meta.error_type === 'invalid_limit'){
	        	res.status(500).send('Access limit exceeded for API key');
	        }else{
	        	const user = new User({
	        		id : data.response.user.user_name,
	        		access_token : token,
	        		general_purpose : true
	        	})
	        	user.save()
	        		.then(() => res.send('Success!'))
	        		.catch(err => res.status(500).send(err))
	        }
	  	  });
	    }else{
	    	res.status(500).send(err)
	    }
	  });
	});

	return router;	
}
