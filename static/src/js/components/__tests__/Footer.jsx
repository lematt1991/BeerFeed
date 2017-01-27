import React from 'react'
import {shallow} from 'enzyme'
import toJson from 'enzyme-to-json'
import sinon from 'sinon'

import Footer from '../Footer'

describe('<Footer/>', () => {
	it('mounts', () => {
		var wrapper = shallow(<Footer/>)

		expect(toJson(wrapper)).toMatchSnapshot()
	})
})