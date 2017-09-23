import {FETCH_DATA, UPDATE_DATA, CHANGE_FEED} from '../actions/Types'
import * as DataActions from '../actions/DataActions'

var fetchPending = false;

export default ({dispatch}) => next => action => {
  if(action.type === `${FETCH_DATA}_PENDING` || action.type === `${UPDATE_DATA}_PENDING`){
    fetchPending = true;
  }else if(
    action.type === `${FETCH_DATA}_SUCCESS` || 
    action.type === `${FETCH_DATA}_ERROR` ||
    action.type === `${UPDATE_DATA}_SUCCESS` || 
    action.type === `${UPDATE_DATA}_ERROR`
  ){
    fetchPending = false;
  }else if(action.type === CHANGE_FEED){
    dispatch(DataActions.fetchData(action.payload))
  }
  next(action)
}