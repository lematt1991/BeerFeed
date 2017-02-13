/**
 * Settings Store
 * @flow
 */
import EventEmitter from 'events';
import dispatcher from '../Dispatcher';
import cookie from 'react-cookie';
import {browserHistory} from 'react-router'

import type {Action} from '../actions/Types'
import type {Location} from './LocationStore'

type Feed = {
	coordinates : Array<number>,
	name : string,
	topRating : number
}

export type Feeds = {
	rochester_feed : Feed,
	nyc_feed : Feed,
	worker1234 : Feed,
	lexxx320 : Feed,
	lematt1991 : Feed
}

export type FeedName = $Keys<Feeds>

class SettingsStore extends EventEmitter{
	feeds : Feeds;
	whichFeed : FeedName;
	checkin_count_threshold : number;

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
		this.whichFeed = browserHistory.getCurrentLocation().query.feed || storedLoc || 'nyc_feed'
		if(this.feeds[this.whichFeed] == null){
			this.whichFeed = 'nyc_feed'
		}
		if(!storedLoc){
			cookie.save('beerFeedLocation', this.whichFeed)
		}
		this.checkin_count_threshold = 1;
	}

	getCurrentLoc() : Array<number> {
		return this.feeds[this.whichFeed].coordinates;
	}

	setFeed(feed : FeedName) : void {
		this.whichFeed = feed;
		cookie.save('beerFeedLocation', feed)
		this.emit('change')
	}

	getFeeds() : Feeds {
		return this.feeds;
	}

	getCurrentFeed() : FeedName{
		return this.whichFeed;
	}

	getCheckinCountThreshold() : number{
		return this.checkin_count_threshold
	}

	handleActions(action : Action) : void{
		switch(action.type){
			case 'CHANGE_FEED':
				this.setFeed(action.feed);
				break;
			case 'CHANGE_CHECKIN_COUNT_THRESHOLD':
				this.checkin_count_threshold = action.threshold;
				this.emit('change-checkin-count-threshold')
				break;
		}
	}
}


const settingsStore = new SettingsStore();

dispatcher.register(settingsStore.handleActions.bind(settingsStore))

export default settingsStore

