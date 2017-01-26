import {EventEmitter} from 'events';
import settingsStore from 'beerfeed/stores/SettingsStore'
import update from 'react/lib/update';
import $ from 'jquery'
import dispatcher from '../Dispatcher'
import * as _ from 'lodash'

class DataStore extends EventEmitter{

	fetchData = () => {
		$.get(`/Feed?user=${this.currentFeed}&lastID=${this.lastID}`).then(
			(data) => {
				if(data.checkins){
					this.lastID = data.lastID
					this.feedData = data.checkins.concat(this.feedData);

					var threshold = settingsStore.getFeeds()[this.currentFeed].topRating;

					for(var i = 0; i < data.checkins.length; i++){
						var checkin = data.checkins[i];
						if(this.mapData[checkin.venue_id]){
							this.mapData[checkin.venue_id].push(checkin);
						}else{
							this.mapData[checkin.venue_id] = [checkin]
						}

						if(checkin.rating >= threshold && checkin.checkin_count >= 5){
							this.topBeers.push(checkin)
						}
					}
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
				this.feedData = {};
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

