import React from 'react'

process.env.NODE_ENV='production'; //To suppress the logger

import {shallow} from 'enzyme'
import {Checkins1} from '../../test_data/Checkins'

describe('SearchStore', () => {
	var store;
	var SearchActions;

	beforeEach(() => {
		jest.resetModules()
		store = require('../../Store').default;
		SearchActions = require('../../actions/SearchActions')
	})

	it('Changes the search term', () => {
		expect(store.getState().search.searchTerm).toBe('')

		store.dispatch(SearchActions.changeSearchTerm('search term'))

		expect(store.getState().search.searchTerm).toBe('search term')
	})
})