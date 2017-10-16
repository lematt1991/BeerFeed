import React from 'react'
import Enzyme, {shallow} from 'enzyme'
import toJson from 'enzyme-to-json'
import sinon from 'sinon'
import Adapter from 'enzyme-adapter-react-16'

import QA from '../QA'

Enzyme.configure({ adapter: new Adapter() });

describe('<QA/>', () => {
	it('mounts', () => {
		var wrapper = shallow(<QA/>)

		expect(toJson(wrapper)).toMatchSnapshot()
	})
})