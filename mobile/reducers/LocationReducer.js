import {SET_LOCATION} from '../actions/Types'

const initialState = {}

export default (state = initialState, action) => {
	switch(action.type){
		case SET_LOCATION:
			return action.payload
		default:
			return state;
	}
}
