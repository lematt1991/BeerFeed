import React from 'react'
import {shallow} from 'enzyme'
import toJson from 'enzyme-to-json'
import sinon from 'sinon'
import * as _ from 'lodash'

import {Checkins1, WithTopCheckins} from '../../test_data/Checkins'

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
		jest.resetModules()
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

	it('Map Data is accounted for', () => {
		reply(Checkins1)
		var DataStore = require('../DataStore').default

		var mapData = DataStore.getMapData()

		Checkins1.checkins.forEach(checkin => {
			delete mapData[checkin.venue_id].beers[checkin.bid]
			if(Object.keys(mapData[checkin.venue_id].beers).length === 0){
				delete mapData[checkin.venue_id]
			}
		})

		expect(Object.keys(mapData).length).toBe(0)
	})

	it('Adds to top checkins', () => {
		reply(WithTopCheckins)
		var DataStore = require('../DataStore').default
		expect(DataStore.getTopCheckins().length).toBe(0)
		reply({checkins : WithTopCheckins.checkins.slice(0, 2), lastID : WithTopCheckins.lastID + 1})
		DataStore.fetchData()
		var topCheckins = DataStore.getTopCheckins()
		expect(topCheckins.length).toBe(2)
		expect(topCheckins[0].rating).toBeGreaterThan(topCheckins[1].rating)
	})

	// it('Resets when the feed changes', () => {
	// 	reply(WithTopCheckins)
	// 	var DataStore = require('../DataStore').default
	// 	var SettingsActions = require('../../actions/SettingsActions')

	// 	var stub = sinon.stub(DataStore, 'fetchData')

	// 	SettingsActions.changeFeed('fake_feed')

	// 	expect(DataStore.getFeedData().length).toBe(0)
	// 	sinon.assert.called(stub)
	// })
})