import {EventEmitter} from 'events';
import settingsStore from 'beerfeed/stores/SettingsStore'
import update from 'react/lib/update';
import $ from 'jquery'
import * as _ from 'lodash'
import {BACKEND_URL} from 'beerfeed/Constants'

class DataStore extends EventEmitter{

	fetchData = () => {
		$.get(`${BACKEND_URL}/Feed?user=${this.currentFeed}&lastID=${this.lastID}`).then(
			(data) => {
				if(data.checkins){
					this.lastID = data.lastID
					this.data = data.checkins.concat(this.data);

					var threshold = settingsStore.getFeeds()[this.currentFeed].topRating;

					for(var i = 0; i < data.checkins.length; i++){
						var checkin = data.checkins[i];
						if(this.mapData[checkin.venue_id]){
							this.mapData[checkin.venue_id].push(checkin);
						}else{
							this.mapData[checkin.venue_id] = [checkin]
						}

						if(checkin.rating >= threshold){
							if(this.topBeers[checkin.venue_id]){
								if(this.topBeers[checkin.venue_id][checkin.bid]){
									this.topBeers[checkin.venue_id][checkin.bid].push(checkin)
								}else{
									this.topBeers[checkin.venue_id][checkin.bid] = [checkin];
								}
							}else{
								this.topBeers[checkin.venue_id] = {
									[checkin.bid] : [checkin]
								}
							}
						}

					}
					var that = this;

					this.emit('new-data')
				}
			}
		)
	}

	orderByRating = (x, y) => {
		return x.rating > y.rating ? -1 : 1
	}

	getTopCheckins(){
		var data = []
		Object.keys(this.topBeers).forEach(vkey => {
			Object.keys(this.topBeers[vkey]).forEach(bkey => {
				var beers = this.topBeers[vkey][bkey]
				if(beers.length >= 5){
					var newestDate = _.reduce(beers, (res, beer) => {
						var d = new Date(beer.created)
						return res > d ? res : d;
					}, new Date(0))
					var beer = beers[0]
					data.push({
						bid : beer.bid,
						brewery : beer.brewery,
						brewery_id : beer.brewery_id,
						beer : beer.name,
						rating : beer.rating,
						venue : beer.venue,
						numCheckins : beers.length,
						lastCheckin : newestDate,
						venue_id : beer.venue_id,
						bid : beer.bid,
						beer_slug : beer.beer_slug
					})
				}
			})
		})
		data.sort(this.orderByRating)
		return data;
	}

	getFeedData(){
		return this.data;
	}

	getMapData(){
		return this.mapData;
	}

	constructor(){
		super();
		settingsStore.on('change', () => {
			this.lastID = 0;
			this.data = []
			this.currentFeed = settingsStore.getCurrentFeed()
			this.fetchData()
		})
		this.lastID = 0
		this.data = []
		this.mapData = {};
		this.topBeers = {};
		this.currentFeed = settingsStore.getCurrentFeed()
		this.fetchData()
		setInterval(this.fetchData, 5000);
	}
}


export default new DataStore();