import {
	CHANGE_FEED, 
	CHANGE_CHECKIN_COUNT_THRESHOLD, 
	FETCH_FEEDS,
	CHANGE_FEED_ORDERING,
	CHANGE_SEARCH_TERM
} from '../actions/Types'

const initialState = {
	feeds : {},
	currentFeed : 'nyc_feed',
	checkin_count_threshold : 3,
	ordering : 'date',
	searchTerm : ''
}

export default (state=initialState, action) => {
	switch(action.type){
		case CHANGE_FEED:
			return {...state, currentFeed : action.payload}
		case CHANGE_CHECKIN_COUNT_THRESHOLD:
			return {...state, checkin_count_threshold : action.payload}
		case `${FETCH_FEEDS}_SUCCESS`:
			var feeds = {};
			for(let feed of action.payload){
				feeds[feed.id] = feed;
			}
			return {...state, feeds : feeds}
		case CHANGE_FEED_ORDERING:
			return {...state, ordering : action.payload}
		case CHANGE_SEARCH_TERM:
			return {...state, searchTerm : action.payload}
		default:
			return state;
	}
}

