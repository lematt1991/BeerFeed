
import search from './reducers/SearchReducer'
import data from './reducers/DataReducer'
import settings from './reducers/SettingsReducer'
import {persistStore, autoRehydrate, getStoredState, createPersistor} from 'redux-persist'
import {createStore, combineReducers, applyMiddleware, compose} from 'redux'
import API from './middleware/API'
import ChangeFeed from './middleware/ChangeFeed'
import {createLogger} from 'redux-logger'

const reducer = combineReducers({
  search,
  settings,
  data
})

const middleware = applyMiddleware(API, ChangeFeed, createLogger())
export default createStore(reducer, undefined, compose(middleware, autoRehydrate()))


// const persistConfig = {
	
// }

// var store;
// var persistor;

// getStoredState(persistConfig, (err, restoredState) => {
// 	if(err){
// 		console.log(err)
// 	}else{
// 		store = createStore(reducer, restoredState, middleware)
// 		persistor = createPersistor(store, persistConfig)
// 	}
// })

// export default store;
