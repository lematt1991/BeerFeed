import React from 'react'
import {shallow} from 'enzyme'
import toJson from 'enzyme-to-json'
import sinon from 'sinon'

import FeedRow from '../FeedRow'
import {Checkins1} from '../../test_data/Checkins'

describe('<FeedRow/>', () => {
	var toLocaleString;

	beforeAll(() => {
		toLocaleString = sinon.stub(Date.prototype, 'toLocaleString', () => 'fake time')
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
		const dispatch = jest.fn()

		var checkin = Checkins1.checkins[0]
		var wrapper = shallow(<FeedRow {...checkin} dispatch={dispatch}/>)
		wrapper.find('#goto-map').simulate('click')



		var arg = dispatch.mock.calls[0][0]
		expect(arg).toMatchObject({
		  "payload": {
		    "args": [{"pathname": "/map/3139082"}],
		    "method": "push"
		  },
		  "type": "@@router/CALL_HISTORY_METHOD"
		})
	})
})