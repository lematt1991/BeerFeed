import Permissions from 'react-native-permissions'
import store from './Store'
import * as LocationActions from './actions/LocationActions'
import {AppState} from 'react-native'

export function getLocation(){
	Permissions.getPermissionStatus('location')
    .then(response => {
    	if(response === 'authorized'){
    		navigator.geolocation.getCurrentPosition(location => {

    			const latitudeDelta = store.getState().location.latitudeDelta || 0.022;
					const longitudeDelta = store.getState().location.longitudeDelta || 0.121;
					const region = {
						latitude : location.coords.latitude,
						longitude : location.coords.longitude,
						latitudeDelta,
						longitudeDelta
					}
					store.dispatch(LocationActions.setLocation(region))
					return region
    		}, err => {
    			console.log(err)
    		})

    		console.log('authorized!')
    	}else{
    		console.log(response)
    	}
    });
}
/*
var currentState = AppState.currentState;
function handleAppStateChange(nextAppState){
	if(currentState.match(/inactive|background/) && nextAppState === 'active'){
		//App just came to the foreground
		getLocation()
	}
	currentState = nextAppState;

}
*/




