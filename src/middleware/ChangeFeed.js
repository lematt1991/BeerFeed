import {FETCH_DATA, UPDATE_DATA, CHANGE_FEED} from '../actions/Types'
import * as DataActions from '../actions/DataActions'

export default store => next => action => {
  if(
    action.type === `${FETCH_DATA}_SUCCESS` || 
    action.type === `${FETCH_DATA}_ERROR` ||
    action.type === `${UPDATE_DATA}_SUCCESS` || 
    action.type === `${UPDATE_DATA}_ERROR`
  ){
    console.log('Scheduling next data fetch... ' + action.type)
    setTimeout(() => {
      const { lastID } = store.getState().data;
      const { currentFeed } = store.getState().settings;
      store.dispatch(DataActions.updateData(currentFeed, lastID));
    }, 5000)
  }else if (action.type === CHANGE_FEED){
    store.dispatch(DataActions.fetchData(action.payload));
  }
  next(action)
}