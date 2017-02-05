import React from 'react'
import {shallow} from 'enzyme'
import toJson from 'enzyme-to-json'
import sinon from 'sinon'

import {Checkins1} from '../../test_data/Checkins'

describe('SearchStore', () => {
	var SearchActions;
	var SearchStore;

	beforeEach(() => {
		jest.resetModules()

		SearchStore = require('../SearchStore').default
		SearchActions = require('../../actions/SearchActions')
	})

	it('Changes the search term', done => {
		expect(SearchStore.getSearchTerm()).toBe('')
		
		SearchStore.on('change', () => {
			expect(SearchStore.getSearchTerm()).toBe('search term')
			done()
		})
		SearchActions.changeSearchTerm('search term')
	})
})