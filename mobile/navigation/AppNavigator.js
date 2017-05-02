import {TabNavigator, StackNavigator} from 'react-navigation'

import ListView from '../pages/ListView'
import MapView from '../pages/MapView'
import Settings from '../pages/Settings'
import Auth from '../pages/Auth'
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
})

export default StackNavigator({
	InitializingPage : {screen : InitializingPage},
//	AuthScreen : {screen : Auth},
	MainNavigator : {screen : tabNavigator}
}, {
	headerMode : 'none'
})