/**
 * Flux Types
 * @flow
 */

import type {FeedName} from '../stores/SettingsStore'

export type Action = {
	type : 'CHANGE_SEARCH_TERM',
	term : string
} | {
	type : 'CHANGE_FEED',
	feed : FeedName
} | {
	type : 'CHANGE_CHECKIN_COUNT_THRESHOLD',
	threshold : number
}

export const CHANGE_SEARCH_TERM = 'CHANGE_SEARCH_TERM';
export const FETCH_FEEDS = 'FETCH_FEEDS';
export const CHANGE_FEED = 'CHANGE_FEED';
export const CHANGE_CHECKIN_COUNT_THRESHOLD = 'CHANGE_CHECKIN_COUNT_THRESHOLD';
export const FETCH_DATA = 'FETCH_DATA';
export const UPDATE_DATA = 'UPDATE_DATA';