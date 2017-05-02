import {FETCH_DATA, UPDATE_DATA} from './Types'
import store from '../Store'

export const fetchData = (feed) => {
	const {searchTerm, ordering, checkin_count_threshold} = store.getState().settings
	return {
		type : FETCH_DATA,
		payload : {
			method : 'GET',
			url : `/Feed/${feed}`
		},
		meta : {
			api : true, 
			transform : data => ({
				data,
				searchTerm,
				ordering,
				checkin_count_threshold
			})
		}
	}
}
export const updateData = (feed, lastID) => {
	const {searchTerm, ordering, checkin_count_threshold} = store.getState().settings
	return {
		type : UPDATE_DATA,
		payload : {
			method : 'GET',
			url : `/FEED/${feed}/${lastID}`
		},
		meta : {
			api : true,
			transform : data => ({
				data,
				searchTerm,
				ordering,
				checkin_count_threshold
			})
		}
	}
}
