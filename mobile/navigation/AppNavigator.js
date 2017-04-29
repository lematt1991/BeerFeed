import {TabNavigator} from 'react-navigation'

import ListView from '../pages/ListView'
import MapView from '../pages/MapView'

export default TabNavigator({
	Feed : {
		screen : ListView
	},
	Map : {
		screen : MapView
	}
})