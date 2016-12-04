import React from 'react';
import {expect} from 'chai';
import {mount, render, shallow} from 'enzyme';
import Feed from 'beerfeed/components/Feed'
import {small, large} from '../data/checkins'
import * as _ from 'lodash'

describe('<Feed/>', () => {
	it('Mount empty component', () => {
		const wrapper = shallow(
			<Feed location={{query : ''}}/>
		)	
		expect(wrapper.find('tbody').children().length).to.equal(0)
	}) 

	it('Mount non-empty component', () => {
		const wrapper = shallow(
			<Feed location={{query : ''}}/>
		)
		wrapper.setState(_.extend({}, wrapper.state(), {
			rows : small
		}))

		expect(wrapper.find('tbody').children().length).to.equal(small.length)
	})

	it('Mount many rows', () => {
		const wrapper = shallow(
			<Feed location={{query : ''}}/>
		)
		const numRows = wrapper.state('numRows')
		wrapper.setState(_.extend({}, wrapper.state(), {
			rows : large
		}))
		expect(wrapper.find('tbody').children().length).to.equal(numRows)
	})

	it('Show more rows', () => {
		const wrapper = mount(
			<Feed location={{query : ''}}/>
		)
		const numRows = wrapper.state('numRows')
		wrapper.setState(_.extend({}, wrapper.state(), {
			rows : large
		}))
		expect(wrapper.find('tbody').children().length).to.equal(numRows)

		wrapper.find('Button').simulate('click')
		const newNumRows = wrapper.state('numRows')
		expect(wrapper.find('tbody').children().length).to.equal(newNumRows)
		expect(newNumRows).to.be.above(numRows)

	})

})


















