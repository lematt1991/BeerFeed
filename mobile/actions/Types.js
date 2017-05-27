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
export const SET_HOME_LOCATION = 'SET_HOME_LOCATION';
export const SET_LOCATION = 'SET_LOCATION';
export const CHANGE_FEED_ORDERING = 'CHANGE_FEED_ORDERING';
export const LOGIN_USER = 'LOGIN_USER';
export const LOGOUT_USER = 'LOGOUT_USER';