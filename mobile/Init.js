import { Location, Constants, Permissions } from 'expo';
import store from './Store'
import * as LocationActions from './actions/LocationActions'
import {AppState} from 'react-native'

function getLocation(){
	//Get the users location
	Permissions.askAsync(Permissions.LOCATION)
	.then(({status}) => {
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
			store.dispatch(LocationActions.setLocation({
				latitude : location.coords.latitude,
				longitude : location.coords.longitude,
				latitudeDelta,
				longitudeDelta
			}))
		}
	})	
}

getLocation()

var currentState = AppState.currentState;
function handleAppStateChange(nextAppState){
	if(currentState.match(/inactive|background/) && nextAppState === 'active'){
		//App just came to the foreground
		getLocation()
	}
	currentState = nextAppState;

}