/**
 * Settings Actions
 * @flow
 */

import dispatcher from '../Dispatcher';
import type {FeedName} from '../stores/SettingsStore'

export function changeFeed(feed : FeedName){
	dispatcher.dispatch({
		type: 'CHANGE_FEED',
		feed : feed
	})
}

export function changeCheckinCountThreshold(threshold : number){
	dispatcher.dispatch({
		type : 'CHANGE_CHECKIN_COUNT_THRESHOLD',
		threshold : threshold
	})
}