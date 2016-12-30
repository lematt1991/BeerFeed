import {EventEmitter} from 'events';
import dispatcher from 'beerfeed/Dispatcher';
import cookie from 'react-cookie';

class SettingsStore extends EventEmitter{
	constructor(){
		super();
		this.feeds = {
			rochester_feed : {
				coordinates : [43.1558, -77.5909], 
				name: 'Rochester, NY',
				topRating : 4.3
			},
			nyc_feed : {
				coordinates : [40.789, -73.9479], 
				name : 'New York, NY',
				topRating : 4.4
			},
			worker1234 : {
				coordinates : [44.975715, -93.263540],
				name : 'Minneapolis, MN',
				topRating : 4.3
			},
			lexxx320 : {
				coordinates : [41.881721, -87.630746],
				name : 'Chicago, IL',
				topRating : 4.4
			},
			lematt1991 : {
				coordinates : [34.046257, -118.246787],
				name : 'Los Angeles, CA',
				topRating : 4.4
			}
		}
		var storedLoc = cookie.load('beerFeedLocation')
		this.whichFeed = storedLoc ? storedLoc : 'nyc_feed';
		if(this.feeds[this.whichFeed] === undefined){
			console.log('Error, cookie feed error')
			this.whichFeed = 'nyc_feed';
		}
		if(!storedLoc){
			cookie.save('beerFeedLocation', this.whichFeed)
		}
	}

	getCurrentLoc(){
		return this.feeds[this.whichFeed].coordinates;
	}

	setFeed(feed){
		this.whichFeed = feed;
		cookie.save('beerFeedLocation', feed)
		this.emit('change')
	}

	getFeeds(){
		return this.feeds;
	}
	getCurrentFeed(){
		return this.whichFeed;
	}

	handleActions(action){
		switch(action.type){
			case 'CHANGE_FEED':
				this.setFeed(action.feed);
				break;
		}
	}
}


const settingsStore = new SettingsStore();

dispatcher.register(settingsStore.handleActions.bind(settingsStore))

export default settingsStore

