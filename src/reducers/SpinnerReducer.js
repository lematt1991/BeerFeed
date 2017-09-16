
const initialState = {
	loading : false
}

export default (state = initialState, action) => {
	switch(action.type){
		case 'FETCH_DATA_PENDING':
			return {...state, loading : true}
		case 'FETCH_DATA_SUCCESS':
		case 'FETCH_DATA_FAILURE':
			return {...state, loading : false}
		default:
			return state;
	}
}