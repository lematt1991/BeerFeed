
import {CHANGE_SEARCH_TERM} from '../actions/Types'

const initialState = {
	searchTerm : ''
}

export default (state=initialState, action) => {
	switch(action.type){
		case CHANGE_SEARCH_TERM:
			return {...state, searchTerm : action.payload};
		default:
			return state;
	}
}

