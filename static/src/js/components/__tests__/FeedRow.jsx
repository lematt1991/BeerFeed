import React from 'react'
import {shallow} from 'enzyme'
import toJson from 'enzyme-to-json'
import sinon from 'sinon'

import FeedRow from '../FeedRow'
import {Checkins1} from '../../test_data/Checkins'

describe('<FeedRow/>', () => {
	var toLocaleString;

	beforeAll(() => {
		toLocaleString = sinon.stub(Date.prototype, 'toLocaleString', (a1, a2) => 'fake time')
	})

	afterAll(() => {
		toLocaleString.restore()
	})

	it('Mounts', () => {
		const context = {
			router : {
				push : jest.fn()
			}
		}
		var wrapper = shallow(<FeedRow {...Checkins1.checkins[0]}/>, {context})
		expect(toJson(wrapper)).toMatchSnapshot()
	})

	it('Goes to the map when a venue is clicked', () => {
		const context = {
			router : {
				push : jest.fn()
			}
		}

		var checkin = Checkins1.checkins[0]
		var wrapper = shallow(<FeedRow {...checkin}/>, {context})
		wrapper.find('#goto-map').simulate('click')

		var arg = context.router.push.mock.calls[0][0]
		expect(arg).toMatchObject({
			pathname : '/map',
			query : {
				venue : checkin.venue_id
			}
		})
	})
})