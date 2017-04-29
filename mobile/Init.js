import { Location, Constants, Permissions } from 'expo';
import store from './Store'
import * as LocationActions from './actions/LocationActions'

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
		store.dispatch(LocationActions.setLocation(location.coords))
	}
})	