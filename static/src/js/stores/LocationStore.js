import {EventEmitter} from 'events';
import dispatcher from '../Dispatcher';
import cookie from 'react-cookie';
import settingsStore from '../stores/SettingsStore';

class LocationStore extends EventEmitter{
	constructor(){
		super();
		this.userLocation = new Promise((resolve, reject) => {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(position => {
					console.log('Got current position!')
					this.foundLocation = true
					this.location = {lat : position.coords.latitude, lng : position.coords.longitude}
					resolve({lat : position.coords.latitude, lng : position.coords.longitude});
					this.emit('got-location')
				})
    		}else{
    			console.log('No HTML5 geolocation available')
    			resolve(settingsStore.getCurrentLoc())
    		}
		})
	}

	haveUserLocation = () => {
		return this.foundLocation
	}

	getLocation = () => {
		return this.location;
	}

	getLocationPromise(){
		return this.userLocation
	}
}


export default new LocationStore();
