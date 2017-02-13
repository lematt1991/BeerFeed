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