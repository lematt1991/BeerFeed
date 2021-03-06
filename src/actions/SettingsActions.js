/**
 * Settings Actions
 * @flow
 */

import type {FeedName} from '../Types'
import {FETCH_FEEDS, CHANGE_FEED, CHANGE_CHECKIN_COUNT_THRESHOLD} from './Types'

export const changeFeed = (feed : FeedName) => ({
	type : CHANGE_FEED,
	payload : feed
})

export const changeCheckinCountThreshold = (threshold : number) => ({
	type : CHANGE_CHECKIN_COUNT_THRESHOLD,
	payload : threshold
})

export const fetchFeeds = {
	type : FETCH_FEEDS,
	payload : {
		method : 'GET',
		url : '/Feeds'
	},
	meta : 'API'
}