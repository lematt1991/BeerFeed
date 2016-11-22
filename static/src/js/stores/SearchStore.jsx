import {EventEmitter} from 'events';
import dispatcher from 'beerfeed/Dispatcher';

class SearchStore extends EventEmitter{
	constructor(){
		super();
		this.searchTerm = '';
	}

	setSearchTerm = (term) => {
		this.searchTerm = term;
		this.emit('change')
	}

	getSearchTerm = () => {
		return this.searchTerm;
	}

	handleActions = (action) => {
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

