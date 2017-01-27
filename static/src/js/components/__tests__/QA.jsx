import React from 'react'
import {shallow} from 'enzyme'
import toJson from 'enzyme-to-json'
import sinon from 'sinon'

import QA from '../QA'

describe('<QA/>', () => {
	it('mounts', () => {
		var wrapper = shallow(<QA/>)

		expect(toJson(wrapper)).toMatchSnapshot()
	})
})