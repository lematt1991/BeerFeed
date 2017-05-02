import update from 'immutability-helper'
import {FETCH_DATA, UPDATE_DATA} from '../actions/Types'
import SearchInput, {createFilter} from 'react-search-input'

const initialState = {
	lastID : 0, 
	feedData : [],
	mapData : {},
	topBeers : [],
	searchTerm : '',
	visibleRows : [],
	numRows : 20
}

orderByDate = (x, y) => {
	return x.checkin_id > y.checkin_id ? -1 : 1
}

orderByRating = (x, y) => {
	return x.rating > y.rating ? -1 : 1
}

orderByDistance = loc => (x, y) => {
	var d1 = Math.pow(x.lat - loc.lat, 2) + Math.pow(x.lon - loc.lng, 2)
	var d2 = Math.pow(y.lat - loc.lat, 2) + Math.pow(y.lon - loc.lng, 2)
	return d1 < d2 ? -1 : 1
}

const KEYS_TO_FILTER = ['brewery', 'name', 'venue']


const getVisibleRows = (feedData, numRows, searchTerm, ordering, threshold) => {
	var filter = createFilter(searchTerm, KEYS_TO_FILTER)
	var rows = feedData.filter(r => r.checkin_count >= threshold && filter(r))

	if(ordering === 'date'){
		rows.sort(orderByDate);
	}else if (ordering === 'rating'){
		rows.sort(orderByRating);
	}

	console.log(threshold)

	return rows; //rows.slice(0, numRows)
}

/**
 * Add fresh batch of data to the `state`.  This should
 * be called either on initialization or when the feed
 * changes.
 * @param  {Object} state - Redux state
 * @param  {Array} data   - New data to be processed
 * @return {Object}       - New Redux state
 */
const setData = (state, {data, searchTerm, ordering, checkin_count_threshold}) => {
	var mapData = {};
	for(var i = 0; i < data.checkins.length; i++){
		var row = data.checkins[i];

		row.index = i;
		row.key = `${row.venue_id}-${row.bid}-${row.checkin_count}`;

		if(mapData[row.venue_id]){
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
		lastID : data.lastID,
		visibleRows : getVisibleRows(data.checkins, state.numRows, searchTerm, ordering, checkin_count_threshold)
	};
}

function validate(feedData, mapData){
	for(let row of feedData){
		const venue = mapData[row.venue_id];
		if(venue == null){
			console.log(`Venue ${row.venue_id} is NULL in mapData`)
		}
		const beer = venue.beers[row.bid]
		if(beer == null){
			console.log(venue)
			console.log(`Beer ${row.bid} is NULL in mapData`)
		}
	}
}

/**
 * Update the existing data in `state`.  This should be
 * called when we are incrementally adding more data
 * that we have already fetched from the server.
 * @param  {Object} state - Redux state
 * @param  {Array} data   - New data to be processed
 * @return {Object}       - New Redux state.
 */
const updateData = (state, {data, searchTerm, ordering, checkin_count_threshold}) => {
	if(!data.checkins){
		return state
	}
	var feedData = state.feedData.slice();
	var mapData = state.mapData;

	for(let row of data.checkins){
		if(mapData[row.venue_id]){
			//The venue exists
			const entry = mapData[row.venue_id].beers[row.bid];
			if(entry){
				//This beer exists at this venue.
				mapData = update(mapData, {
					[row.venue_id] : {
						beers : {
							[row.bid] : {
								checkin_count : {$set : entry.checkin_count + row.checkin_count},
								created : {$set : row.created},
								checkin_id : {$set : row.checkin_id}
							}
						}
					}
				})

				console.log(row.name)
				console.log(`${feedData[entry.index].bid} vs. ${row.bid}`)
				if(feedData[entry.index].bid !== row.bid){
					console.log('Impossible!!!!')
				}

				feedData[entry.index].checkin_count += row.checkin_count;
				feedData[entry.index].created = row.created;
				feedData[entry.index].checkin_id = row.checkin_id
				feedData[entry.index].key = `${row.venue_id}-${row.bid}-${feedData[entry.index].checkin_count}`

			}else{
				//bid doesn't exist for this venue.
				row.index = feedData.length;
				row.key = `${row.venue_id}-${row.bid}-${row.checkin_count}`;
				
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
			row.key = `${row.venue_id}-${row.bid}-${row.checkin_count}`;
			feedData.push(row);
		}
	}
	return {
		...state, 
		feedData : feedData,
		mapData : mapData,
		lastID : data.lastID,
		visibleRows : getVisibleRows(feedData, state.numRows, searchTerm, ordering, checkin_count_threshold)
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

