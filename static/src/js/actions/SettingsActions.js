import dispatcher from '../Dispatcher';

export function changeFeed(feed){
	dispatcher.dispatch({
		type: 'CHANGE_FEED',
		feed : feed
	})
}

export function changeCheckinCountThreshold(threshold){
	dispatcher.dispatch({
		type : 'CHANGE_CHECKIN_COUNT_THRESHOLD',
		threshold : threshold
	})
}