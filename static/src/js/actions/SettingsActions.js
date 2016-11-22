import dispatcher from 'beerfeed/Dispatcher';

export function changeFeed(feed){
	dispatcher.dispatch({
		type: 'CHANGE_FEED',
		feed : feed
	})
}