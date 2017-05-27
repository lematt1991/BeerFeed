import {SET_LOCATION, SET_HOME_LOCATION} from './Types'


export const setLocation = location => ({
	type : SET_LOCATION,
	payload : location
})

export const setHomeLocation = location => ({
	type : SET_HOME_LOCATION,
	payload : location
})