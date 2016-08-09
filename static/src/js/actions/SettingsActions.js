import dispatcher from '../Dispatcher';

export function changeFeed(feed){
	dispatcher.dispatch({
		type: 'CHANGE_FEED',
		feed : feed
	})
}