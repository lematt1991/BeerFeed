import React from 'react'
import Enzyme, {shallow} from 'enzyme'
import toJson from 'enzyme-to-json'
import sinon from 'sinon'
import Adapter from 'enzyme-adapter-react-16'

import About from '../About'

Enzyme.configure({ adapter: new Adapter() });

describe('<About/>', () => {
	it('mounts', () => {
		var wrapper = shallow(<About/>)

		expect(toJson(wrapper)).toMatchSnapshot()
	})

	it('Has the QA component as a child by default', () => {
		var wrapper = shallow(<About/>)

		expect(wrapper.find('QA').exists()).toBeTruthy()
		expect(wrapper.find('LinkAccount').exists()).toBe(false)
	})

	it('Toggles between QA and LinkAccount', () => {
		var wrapper = shallow(<About/>)

		wrapper.find('Button').simulate('click')

		expect(wrapper.update().find('QA').exists()).toBe(false)
		expect(wrapper.update().find('LinkAccount').exists()).toBeTruthy()

		wrapper.find('Button').simulate('click')

		expect(wrapper.find('QA').exists()).toBeTruthy()
		expect(wrapper.find('LinkAccount').exists()).toBe(false)
	})
})