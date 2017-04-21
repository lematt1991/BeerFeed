import {Checkins1} from '../../test_data/Checkins'

process.env.NODE_ENV='production'

describe('SettingsStore', () => {
	var SettingsActions;
	var store;

	beforeEach(() => {
		jest.resetModules()
		store = require('../../Store').default
		SettingsActions = require('../../actions/SettingsActions')
	})

	it('Changes feeds', () => {
		expect(store.getState().settings.currentFeed).toBe('nyc_feed')
		store.dispatch(SettingsActions.changeFeed('rochester_feed'))
		expect(store.getState().settings.currentFeed).toBe('rochester_feed')
	})

	it('Changes the checkin count threshold', () => {
		const thresh = store.getState().settings.checkin_count_threshold;
		store.dispatch(SettingsActions.changeCheckinCountThreshold(thresh+1))
		expect(store.getState().settings.checkin_count_threshold).toBe(thresh+1)
	})
})