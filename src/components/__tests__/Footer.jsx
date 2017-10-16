import React from 'react'
import Enzyme, {shallow} from 'enzyme'
import toJson from 'enzyme-to-json'
import sinon from 'sinon'
import Adapter from 'enzyme-adapter-react-16'

import Footer from '../Footer'

Enzyme.configure({ adapter: new Adapter() });

describe('<Footer/>', () => {
	it('mounts', () => {
		var wrapper = shallow(<Footer/>)

		expect(toJson(wrapper)).toMatchSnapshot()
	})
})