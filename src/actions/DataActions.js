import {FETCH_DATA, UPDATE_DATA} from './Types'

export const fetchData = (feed) => ({
	type : FETCH_DATA,
	payload : {
		method : 'GET',
		url : `/Feed/${feed}`
	},
	meta : 'API'
})

export const updateData = (feed, lastID) => ({
	type : UPDATE_DATA,
	payload : {
		method : 'GET',
		url : `/Feed/${feed}/${lastID}`
	},
	meta : 'API'
})
