import update from 'immutability-helper'
import {FETCH_DATA, UPDATE_DATA} from '../actions/Types'

const initialState = {
	lastID : 0, 
	feedData : [],
	mapData : {},
	topBeers : [],
	checkin_count_threshold : 3
}

/**
 * Add fresh batch of data to the `state`.  This should
 * be called either on initialization or when the feed
 * changes.
 * @param  {Object} state - Redux state
 * @param  {Array} data   - New data to be processed
 * @return {Object}       - New Redux state
 */
const setData = (state, data) => {
	var mapData = {};
	for(var i = 0; i < data.checkins.length; i++){
		var row = data.checkins[i];

		row.index = i;
		row.key = `${row.venue_id}-${row.bid}-${row.checkin_count}`;

		if(data[row.venue_id]){
			mapData[row.venue_id].beers[row.bid] = row;
		}else{
			mapData[row.venue_id] = {
				beers : {
					[row.bid] : row
				},
				lat : row.lat,
				lon : row.lon,
				venue : row.venue
			}
		}
	}
	return {
		...state, 
		feedData : data.checkins, 
		mapData : mapData, 
		lastID : data.lastID
	};
}

/**
 * Update the existing data in `state`.  This should be
 * called when we are incrementally adding more data
 * that we have already fetched from the server.
 * @param  {Object} state - Redux state
 * @param  {Array} data   - New data to be processed
 * @return {Object}       - New Redux state.
 */
const updateData = (state, data) => {
	if(!data.checkins){
		return state
	}
	var feedData = state.feedData.slice();
	var mapData = state.mapData;
	for(let row of data.checkins){
		if(mapData[row.venue_id]){
			const entry = mapData[row.venue_id].beers[row.bid];
			if(entry){
				//This beer exists at this venue.
				mapData = update(mapData, {
					[row.venue_id] : {
						beers : {
							[row.bid] : {
								checkin_count : {$set : entry.checkin_count + row.checkin_count},
								created : {$set : row.created}
							}
						}
					}
				})
				feedData[entry.index].checkin_count += row.checkin_count;
				feedData[entry.index].created = row.created;
			}else{
				//bid doesn't exist for this venue.
				row.index = feedData.length;
				feedData.push(row)
				mapData = update(mapData, {
					[row.venue_id] : {
						beers : {
							[row.bid] : {
								$set : row
							}
						}
					}
				})	
			}
		}else{
			//Venue doesn't exist
			mapData = update(mapData, {
				[row.venue_id] : {
					$set : {
						beers : {
							[row.bid] : row
						},
						lat : row.lat,
						lon : row.lon,
						venue_id : row.venue
					}
				}
			})
			row.index = feedData.length;
			feedData.push(row);
		}
	}
	return {
		...state, 
		feedData : feedData,
		mapData : mapData,
		lastID : data.lastID
	}
}

export default (state = initialState, action) => {
	switch(action.type){
		case `${FETCH_DATA}_SUCCESS`:
			return setData(state, action.payload)
		case `${UPDATE_DATA}_SUCCESS`:
			return updateData(state, action.payload)
		default:
			return state;
	}
}

