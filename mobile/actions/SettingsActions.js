/**
 * Settings Actions
 * @flow
 */

import type {FeedName} from '../stores/SettingsStore'
import {
	FETCH_FEEDS, 
	CHANGE_FEED, 
	CHANGE_CHECKIN_COUNT_THRESHOLD,
	CHANGE_FEED_ORDERING,
	CHANGE_SEARCH_TERM
} from './Types'

export const changeFeed = (feed : FeedName) => ({
	type : CHANGE_FEED,
	payload : feed
})

export const changeCheckinCountThreshold = (threshold : number) => ({
	type : CHANGE_CHECKIN_COUNT_THRESHOLD,
	payload : threshold
})

export const changeSearchTerm = term => ({
	type : CHANGE_SEARCH_TERM,
	payload : term,
	meta : {
		debounce : 300
	}
})

export const fetchFeeds = {
	type : FETCH_FEEDS,
	payload : {
		method : 'GET',
		url : '/Feeds'
	},
	meta : {
		api : true
	}
}

export const changeFeedOrdering = ordering => ({
	type : CHANGE_FEED_ORDERING,
	payload : ordering
})