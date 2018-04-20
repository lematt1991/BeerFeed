
import search from './reducers/SearchReducer'
import data from './reducers/DataReducer'
import settings from './reducers/SettingsReducer'
import location from './reducers/LocationReducer'
import { navReducer } from './navigation/AppNavigator';
import user from './reducers/UserReduer'
import {createStore, combineReducers, applyMiddleware, compose} from 'redux'
import API from './middleware/API'
import ChangeFeed from './middleware/ChangeFeed'
import Debounce from './middleware/Debounce'
import {createLogger} from 'redux-logger'

import { persistStore, persistCombineReducers, persistReducer } from 'redux-persist'
import storage from 'redux-persist/es/storage'
import { AsyncStorage } from 'react-native';

const config = {
  key: 'root',
  storage : AsyncStorage,
}

const reducer = persistReducer(config, combineReducers({
	search,
  settings,
  data,
  location,
  user,
}))

const middleware = applyMiddleware(
	API, 
	ChangeFeed,
	Debounce
	// ,createLogger()
)

export const store = createStore(reducer, middleware);
export const persistor = persistStore(store, {});