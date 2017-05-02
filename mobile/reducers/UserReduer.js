import {LOGIN_USER, LOGOUT_USER} from '../actions/Types'

const initialState = {
	username : null
}

export default (state = initialState, action) => {
	switch(action.type){
		case `${LOGIN_USER}_SUCCESS`:
			return {...state, username : action.payload};
		case LOGOUT_USER:
			return {...state, username : null}
		default:
			return state;
	}
}