import search from './reducers/SearchReducer'
import data from './reducers/DataReducer'
import settings from './reducers/SettingsReducer'
import {createStore, combineReducers, applyMiddleware} from 'redux'
import {createLogger} from 'redux-logger'
import API from './middleware/API'
import ChangeFeed from './middleware/ChangeFeed'
import spinner from './reducers/SpinnerReducer';
import createHistory from 'history/createBrowserHistory'
import { routerReducer, routerMiddleware } from 'react-router-redux'

export const history = createHistory()

const reducer = combineReducers({
  search,
  settings,
  data,
  spinner,
  router : routerReducer
})

var middleware;
if(process.env.NODE_ENV === 'production'){
	middleware = applyMiddleware(API, ChangeFeed, routerMiddleware(history));
}else{
	middleware = applyMiddleware(API, ChangeFeed, routerMiddleware(history), createLogger());
}

export default createStore(reducer, {}, middleware);