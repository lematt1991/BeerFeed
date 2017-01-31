import React from 'react'
import {shallow} from 'enzyme'
import toJson from 'enzyme-to-json'
import sinon from 'sinon'

import {Checkins1} from '../../test_data/Checkins'

describe('SettingsStore', () => {
	var SettingsActions;
	var SettingsStore;

	beforeEach(() => {
		jest.resetModules()

		SettingsStore = require('../SettingsStore').default
		SettingsActions = require('../../actions/SettingsActions')
	})

	it('Changes feeds', done => {
		expect(SettingsStore.getCurrentFeed()).toBe('nyc_feed')

		SettingsStore.on('change', () => {
			expect(SettingsStore.getCurrentFeed()).toBe('rochester_feed')
			expect(Math.round(SettingsStore.getCurrentLoc()[0])).toBe(43)
			expect(Math.round(SettingsStore.getCurrentLoc()[1])).toBe(-78)
			done()
		})

		SettingsActions.changeFeed('rochester_feed')
	})

	it('Changes the checkin count threshold', done => {
		expect(SettingsStore.getCheckinCountThreshold()).toBe(1)

		SettingsStore.on('change-checkin-count-threshold', () => {
			expect(SettingsStore.getCheckinCountThreshold()).toBe(5)
			done()
		})

		SettingsActions.changeCheckinCountThreshold(5)
	})


})