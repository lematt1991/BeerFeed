import search from './reducers/SearchReducer'
import data from './reducers/DataReducer'
import settings from './reducers/SettingsReducer'
import {createStore, combineReducers, applyMiddleware} from 'redux'
import {createLogger} from 'redux-logger'
import API from './middleware/API'
import ChangeFeed from './middleware/ChangeFeed'
import spinner from './reducers/SpinnerReducer';

const reducer = combineReducers({
  search,
  settings,
  data,
  spinner
})

var store;
if(process.env.NODE_ENV === 'production'){
  store = createStore(reducer, {}, applyMiddleware(API, ChangeFeed))
}else{
  store = createStore(reducer, {}, applyMiddleware(API, ChangeFeed, createLogger()))
}

export default store;