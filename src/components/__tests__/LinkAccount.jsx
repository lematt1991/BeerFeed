import React from 'react'
import Enzyme, {shallow, mount} from 'enzyme'
import toJson from 'enzyme-to-json'
import sinon from 'sinon'
import Adapter from 'enzyme-adapter-react-16'

import LinkAccount from '../LinkAccount'

Enzyme.configure({ adapter: new Adapter() });

describe('<LinkAccount/>', () => {
	it('mounts', () => {
		var wrapper = shallow(<LinkAccount/>)

		expect(toJson(wrapper)).toMatchSnapshot()
	})
})