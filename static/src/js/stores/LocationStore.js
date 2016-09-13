import {EventEmitter} from 'events';
import dispatcher from '../Dispatcher';
import cookie from 'react-cookie';
import settingsStore from './SettingsStore';

class LocationStore extends EventEmitter{
	constructor(){
		super();
		this.userLocation = new Promise((resolve, reject) => {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(position) {
					resolve({lat : position.coords.latitude, lng : position.coords.longitude});
				})
    		}else{
    			resolve(settingsStore.getCurrentLoc())
    		}
		})
	}

	getLocationPromise(){
		return this.userLocation
	}
}


export default new LocationStore();
