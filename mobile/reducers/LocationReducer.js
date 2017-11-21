import {SET_LOCATION} from '../actions/Types'

const initialState = {
	longitude: -73.9479,
  latitude: 40.789,
  latitudeDelta : .022,
  longitudeDelta : .121
}

export default (state = initialState, action) => {
	switch(action.type){
		case SET_LOCATION:
			return action.payload
		default:
			return state;
	}
}
