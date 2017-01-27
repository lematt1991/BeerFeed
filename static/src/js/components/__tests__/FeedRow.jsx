import React from 'react'
import {shallow} from 'enzyme'

import FeedRow from '../FeedRow'
import {Checkins1} from '../../test_data/Checkins'

describe('<FeedRow/>', () => {

	it('Mounts', () => {
		const context = {
			router : {
				push : jest.fn()
			}
		}

		var wrapper = shallow(<FeedRow {...Checkins1[0]}/>, {context})



	})
})