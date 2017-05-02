
import search from './reducers/SearchReducer'
import data from './reducers/DataReducer'
import settings from './reducers/SettingsReducer'
import location from './reducers/LocationReducer'
import user from './reducers/UserReduer'
import {persistStore, autoRehydrate, getStoredState, createPersistor} from 'redux-persist'
import {createStore, combineReducers, applyMiddleware, compose} from 'redux'
import API from './middleware/API'
import ChangeFeed from './middleware/ChangeFeed'
import {createLogger} from 'redux-logger'

const reducer = combineReducers({
  search,
  settings,
  data,
  location,
  user
})

const middleware = applyMiddleware(
	API, 
	ChangeFeed 
//	,createLogger()
)
export default createStore(reducer, undefined, compose(middleware, autoRehydrate()))