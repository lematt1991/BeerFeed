import dispatcher from '../Dispatcher';

export function changeSearchTerm(term){
	dispatcher.dispatch({
		type: 'CHANGE_SEARCH_TERM',
		term : term
	})
}