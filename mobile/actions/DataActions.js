import {FETCH_DATA, UPDATE_DATA} from './Types'

export const fetchData = (feed) => ({
	type : FETCH_DATA,
	payload : {
		method : 'GET',
		url : `/Feed/${feed}`
	},
	meta : {
		api : true
	}
})

export const updateData = (feed, lastID) => ({
	type : UPDATE_DATA,
	payload : {
		method : 'GET',
		url : `/FEED/${feed}/${lastID}`
	},
	meta : {
		api : true
	}
})
