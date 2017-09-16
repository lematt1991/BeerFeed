import {CHANGE_SEARCH_TERM} from './Types'
export const changeSearchTerm = term => ({
	type: CHANGE_SEARCH_TERM,
	payload : term
})