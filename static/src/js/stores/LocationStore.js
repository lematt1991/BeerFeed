/**
 * Store to keep track of user location
 * @flow
 */

import EventEmitter from 'events';
import dispatcher from '../Dispatcher';
import cookie from 'react-cookie';
import settingsStore from '../stores/SettingsStore';

export type Location = {
	lat : number,
	lng : number
}

class LocationStore extends EventEmitter{
	foundLocation : boolean;
	location : Location;
	userLocation : Promise<Location>;

	constructor(){
		super();
		this.userLocation = new Promise((resolve, reject) => {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(position => {
					console.log('Got current position!')
					this.foundLocation = true
					this.location = {lat : position.coords.latitude, lng : position.coords.longitude}
					resolve(this.location);
					this.emit('got-location')
				})
    		}else{
    			console.log('No HTML5 geolocation available')
    			var loc : Array<number> = settingsStore.getCurrentLoc()
    			resolve({lat : loc[0], lng : loc[1]})
    		}
		})
	}

	haveUserLocation = () : boolean => {
		return this.foundLocation
	}

	getLocation = () : Location => {
		return this.location;
	}

	getLocationPromise() : Promise<Location> {
		return this.userLocation
	}
}


export default new LocationStore();
