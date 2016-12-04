import React from 'react';
import {expect} from 'chai';
import {mount, render} from 'enzyme';
import FeedRow from 'beerfeed/components/FeedRow';
import {small} from '../data/checkins';

describe('<FeedRow/>', () => {
	it('Mount component', () => {
		const wrapper = mount(
			<FeedRow
				row={small[0]}
			/>
		)	
		expect(wrapper.find('h4').length).to.equal(4)
		wrapper.find('h4').forEach(x => {
			expect(x.text()).to.not.contain('null')
			expect(x.text()).to.not.contain('undefined')
		})
	}) 
})

