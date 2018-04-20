import update from 'immutability-helper'
import {FETCH_DATA, UPDATE_DATA} from '../actions/Types'

const initialState = {
	lastID : 0, 
	feedData : [],
	mapData : {},
	topBeers : [],
	checkin_count_threshold : 3,
	minScore : Number.MAX_SAFE_INTEGER,
	maxScore : 0,
}

const SCORE_THRESH = 3;

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
	var { maxScore, minScore } = state;
	for(var i = 0; i < data.checkins.length; i++){
		var row = data.checkins[i];

		row.index = i;
		row.key = `${row.venue_id}-${row.bid}`;

		if(mapData[row.venue_id]){
			mapData[row.venue_id].beers[row.bid] = row;
			mapData[row.venue_id].score += (row.checkin_count > SCORE_THRESH ? row.beer.rating : 0);
		}else{
			mapData[row.venue_id] = {
				beers : {
					[row.bid] : row
				},
				lat : row.lat,
				lon : row.lon,
				venue : row.venue,
				score : row.checkin_count > SCORE_THRESH ? row.beer.rating : 0
			}
		}
		minScore = Math.min(minScore, mapData[row.venue_id].score);
		maxScore = Math.max(maxScore, mapData[row.venue_id].score);
	}
	return {
		...state, 
		feedData : data.checkins, 
		mapData : mapData, 
		lastID : data.lastID,
		maxScore,
		minScore,
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
	var { minScore, maxScore } = state;

	for(let row of data.checkins){
		if(mapData[row.venue_id]){
			//The venue exists
			const entry = mapData[row.venue_id].beers[row.bid];
			if(entry){
				//This beer exists at this venue.
				const newEntry = {
					...entry,
					checkin_count : entry.checkin_count + row.checkin_count,
					created : row.created,
					checkin_id : row.checkin_id
				}

				//Now we have enough checkins to count this for its score.
				if(entry.checkin_count <= SCORE_THRESH && entry.checkin_count + row.checkin_count > SCORE_THRESH){
					mapData[row.venue_id].score += row.beer.rating;
				}

				mapData = update(mapData, {
					[row.venue_id] : {
						beers : {
							[row.bid] : {$set : newEntry}
						}
					}
				})

				feedData[entry.index] = newEntry;
			}else{
				//bid doesn't exist for this venue.
				row.index = feedData.length;
				row.key = `${row.venue_id}-${row.bid}`;
				
				mapData[row.venue_id].score += (row.checkin_count > SCORE_THRESH ? row.beer.rating : 0);

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
						venue_id : row.venue,
						score : row.checkin_count > SCORE_THRESH ? row.beer.rating : 0
					}
				}
			})
			row.index = feedData.length;
			row.key = `${row.venue_id}-${row.bid}`;
			feedData.push(row);
		}
		const score = mapData[row.venue_id].score;
		maxScore = Math.max(maxScore, score);
		minScore = Math.min(minScore, score);
	}
	return {
		...state, 
		feedData : feedData,
		mapData : mapData,
		lastID : data.lastID,
		minScore,
		maxScore,
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

