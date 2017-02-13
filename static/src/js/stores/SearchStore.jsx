/**
 * @flow
 */
import EventEmitter from 'events';
import dispatcher from '../Dispatcher';
import type {Action} from '../actions/Types'

class SearchStore extends EventEmitter{
	searchTerm : string

	constructor(){
		super();
		this.searchTerm = '';
	}

	setSearchTerm = (term : string) => {
		this.searchTerm = term;
		this.emit('change')
	}

	getSearchTerm = () : string => {
		return this.searchTerm;
	}

	handleActions = (action : Action) : void => {
		switch(action.type){
			case 'CHANGE_SEARCH_TERM':
				this.setSearchTerm(action.term);
				break;
		}
	}
}


const searchStore = new SearchStore();

dispatcher.register(searchStore.handleActions)

export default searchStore

