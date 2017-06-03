
import search from './reducers/SearchReducer'
import data from './reducers/DataReducer'
import settings from './reducers/SettingsReducer'
import location from './reducers/LocationReducer'
import user from './reducers/UserReduer'
import {persistStore, autoRehydrate, getStoredState, createPersistor} from 'redux-persist'
import {createStore, combineReducers, applyMiddleware, compose} from 'redux'
import API from './middleware/API'
import ChangeFeed from './middleware/ChangeFeed'
import Debounce from './middleware/Debounce'
import {createLogger} from 'redux-logger'
import {AsyncStorage} from 'react-native'

const reducer = combineReducers({
  search,
  settings,
  data,
  location,
  user
})

const middleware = applyMiddleware(
	API, 
	ChangeFeed,
	Debounce
	,createLogger()
)

const store = createStore(reducer, undefined, compose(middleware, autoRehydrate({
	// log : true,
	// stateReconciler(state, inboundState, reducedState, config_log){
	// 	return reducedState;
	// }
})))

export default store;
persistStore(store, {storage : AsyncStorage})