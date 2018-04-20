import { Location, Constants, Permissions } from 'expo';
import { store } from './Store'
import * as LocationActions from './actions/LocationActions'
import {AppState} from 'react-native'

export function getLocation(){
	//Get the users location
	console.log('Getting location')
	Permissions.askAsync(Permissions.LOCATION)
	.then(({status}) => {
		console.log(status)
		if(status === 'granted'){
			return Location.getCurrentPositionAsync({})
		}else{
			console.log(status)
		}
	})
	.then(location => {
		if(location){
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
		}
	})	
}

var currentState = AppState.currentState;
function handleAppStateChange(nextAppState){
	if(currentState.match(/inactive|background/) && nextAppState === 'active'){
		//App just came to the foreground
		getLocation()
	}
	currentState = nextAppState;

}