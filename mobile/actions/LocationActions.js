import {SET_LOCATION} from './Types'


export const setLocation = location => ({
	type : SET_LOCATION,
	payload : location
})