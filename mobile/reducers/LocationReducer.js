import {SET_LOCATION, SET_HOME_LOCATION} from '../actions/Types'

const initialState = {
	currentLocation : {
		latitude : 40.789129, 
		longitude : -73.949258,
		latitudeDelta : .22,
		longitudeDelta : .22
	},
	homeLocation : {
		latitude : 40.789129, 
		longitude : -73.949258,
		latitudeDelta : .22,
		longitudeDelta : .22
	}
}

export default (state = initialState, action) => {
	switch(action.type){
		case SET_LOCATION:
			return {...state, currentLocation : action.payload}
		case SET_HOME_LOCATION:
			return {...state, homeLocation : action.payload}
		default:
			return state;
	}
}
