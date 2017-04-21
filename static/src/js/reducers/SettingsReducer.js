import cookie from 'react-cookie';
import {CHANGE_FEED, CHANGE_CHECKIN_COUNT_THRESHOLD, FETCH_FEEDS} from '../actions/Types'
import {browserHistory} from 'react-router'

const initialState = {
	feeds : {},
	currentFeed : 
		browserHistory.getCurrentLocation().query.feed ||
		cookie.load('beerFeedLocation') ||
		'nyc_feed',
	checkin_count_threshold : 3
}

cookie.save('beerFeedLocation', initialState.currentFeed)

export default (state=initialState, action) => {
	switch(action.type){
		case CHANGE_FEED:
			cookie.save('beerFeedLocation', action.payload)
			return {...state, currentFeed : action.payload}
		case CHANGE_CHECKIN_COUNT_THRESHOLD:
			return {...state, checkin_count_threshold : action.payload}
		case `${FETCH_FEEDS}_SUCCESS`:
			var feeds = {};
			for(let feed of action.payload){
				feeds[feed.id] = feed;
			}
			return {...state, feeds : feeds}
		default:
			return state;
	}
}

