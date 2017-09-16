import React from 'react'
import {shallow, mount} from 'enzyme'
import toJson from 'enzyme-to-json'
import sinon from 'sinon'

import LinkAccount from '../LinkAccount'

describe('<LinkAccount/>', () => {
	it('mounts', () => {
		var wrapper = shallow(<LinkAccount/>)

		expect(toJson(wrapper)).toMatchSnapshot()
	})
})