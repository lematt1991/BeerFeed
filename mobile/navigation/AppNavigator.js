import {TabNavigator, StackNavigator} from 'react-navigation'

import ListView from '../pages/ListView'
import MapView from '../pages/MapView'
import Settings from '../pages/Settings'
import InitializingPage from '../pages/InitializingPage'

const tabNavigator = TabNavigator({
	Feed : {
		screen : ListView
	},
	Map : {
		screen : MapView
	},
	Settings : {
		screen : Settings
	}
}, {
	tabBarPosition : 'bottom',
	swipeEnabled : false,
})

export default StackNavigator({
	InitializingPage : {screen : InitializingPage},
	MainNavigator : {screen : tabNavigator}
}, {
	headerMode : 'none'
})