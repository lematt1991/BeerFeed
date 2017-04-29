import {TabNavigator} from 'react-navigation'

import ListView from '../pages/ListView'
import MapView from '../pages/MapView'
import Settings from '../pages/Settings'

export default TabNavigator({
	Map : {
		screen : MapView
	},
		Feed : {
		screen : ListView
	},

	Settings : {
		screen : Settings
	}
})