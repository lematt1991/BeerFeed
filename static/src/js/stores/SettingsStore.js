import {EventEmitter} from 'events';
import dispatcher from '../Dispatcher';
import cookie from 'react-cookie';

class SettingsStore extends EventEmitter{
	constructor(){
		super();
		this.feeds = {
			rochester_feed : {
				coordinates : [43.1558, -77.5909], 
				name: 'Rochester, NY'
			},
			nyc_feed : {
				coordinates : [40.789, -73.9479], 
				name : 'New York, NY'
			},
			worker1234 : {
				coordinates : [44.975715, -93.263540],
				name : 'Minneapolis, MN'
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

