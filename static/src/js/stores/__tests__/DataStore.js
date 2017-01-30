import React from 'react'
import {shallow} from 'enzyme'
import toJson from 'enzyme-to-json'
import sinon from 'sinon'

import {Checkins1} from '../../test_data/Checkins'

describe('DataStore', () => {
	var server;

	function reply(reply){
		server.respondWith(
			"GET", 
			/\/Feed.*/,
     [200, { "Content-Type": "application/json"},
     JSON.stringify(reply)])
	}

	beforeEach(() => {
		server = sinon.fakeServer.create()
		server.respondImmediately = true;
	})

	afterEach(() => {
		server.restore()
	})

	it('Loads data from the server', () => {
		reply(Checkins1)

		var DataStore = require('../DataStore').default

		expect(DataStore.getFeedData().length).toBe(Checkins1.checkins.length)
	})

	it('Handles empty replies', () => {
		reply(Checkins1)
		var DataStore = require('../DataStore').default
		reply([])
		DataStore.fetchData()
		expect(DataStore.getFeedData().length).toBe(Checkins1.checkins.length)
	})

	it('Doesn\'t duplicate checkins and increments checkin counts', () => {
		reply(Checkins1)
		var DataStore = require('../DataStore').default

		var checkin_count = Checkins1.checkins[0].checkin_count

		reply({checkins : [Checkins1.checkins[0]], lastID : Checkins1.lastID})
		DataStore.fetchData()

		var checkins = DataStore.getFeedData()

		expect(checkins.length).toBe(Checkins1.checkins.length)
		var found = false;
		for(var i = 0; i < checkins.length; i++){
			if(
				checkins[i].venue_id === Checkins1.checkins[0].venue_id &&
				checkins[i].bid === Checkins1.checkins[0].bid
			){
				found = true;
				expect(checkins[i].checkin_count).toBe(checkin_count * 2)
			}
		}
		expect(found).toBeTruthy()
	})

})