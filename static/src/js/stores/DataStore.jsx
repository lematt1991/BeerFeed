import {EventEmitter} from 'events';
import settingsStore from '../stores/SettingsStore'
import update from 'react/lib/update';
import $ from 'jquery'
import dispatcher from '../Dispatcher'
import * as _ from 'lodash'

class DataStore extends EventEmitter{
	fetchData = () => {
		$.get(`/Feed?user=${this.currentFeed}&lastID=${this.lastID}`).done(
			(data) => {
				if(data.checkins){
					this.lastID = data.lastID

					data.checkins.forEach((c, i) => {
						var checkin = this.mapData[c.venue_id] && this.mapData[c.venue_id].beers[c.bid];
						var oldCount = 0;
						if(checkin){
							oldCount = checkin.checkin_count
							checkin.checkin_count += c.checkin_count
							checkin.checkin_id = c.checkin_id
							checkin.created = c.created
						}else{
							checkin = c;
							if(this.mapData[checkin.venue_id]){
								this.mapData[checkin.venue_id].beers[checkin.bid] = checkin
							}else{
								this.mapData[checkin.venue_id] = {
									beers : {
										[checkin.bid] : checkin
									},
									lat : checkin.lat,
									lon : checkin.lon,
									venue : checkin.venue
								}
							}
							this.feedData.push(checkin)
						}
						var threshold = settingsStore.getFeeds()[this.currentFeed].topRating;
						if(oldCount < threshold && checkin.checkin_count >= 5 && checkin.rating >= threshold){
							this.topBeers.push(checkin)
						}
						checkin.key = `${checkin.venue_id}${checkin.bid}${checkin.checkin_count}`
					})
					this.emit('new-data')
				}
			}
		)
	}

	orderByRating = (x, y) => {
		return x.rating > y.rating ? -1 : 1
	}

	getTopCheckins(){
		return this.topBeers.sort(this.orderByRating)
	}

	getFeedData(){
		return this.feedData;
	}

	getMapData(){
		return this.mapData;
	}

	constructor(){
		super();
		this.lastID = 0
		this.feedData = []
		this.mapData = {};
		this.topBeers = [];
		this.currentFeed = settingsStore.getCurrentFeed()
		this.fetchData()
		setInterval(this.fetchData, 5000);
	}

	handleActions = action => {
		switch(action.type){
			case 'CHANGE_FEED':
				this.lastID = 0;
				this.feedData = [];
				this.currentFeed = action.feed
				this.topBeers = []
				this.fetchData()
				break;
		}
	}
}

const dataStore = new DataStore();

dispatcher.register(dataStore.handleActions)

export default dataStore;

