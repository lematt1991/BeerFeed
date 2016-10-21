import React from 'react';
import DataStore from '../stores/DataStore';
import * as _ from 'lodash';
import {Table} from 'react-bootstrap';

export default class Stats extends React.Component{

	getVenuesArr = () => {
		var data = DataStore.getFeedData();

		var venues = {}
		for(var i = 0; i < data.length; i++){
			if(venues[data[i].venue]){
				venues[data[i].venue].push(data[i])
			}else{
				venues[data[i].venue] = [data[i]];
			}
		}

		var venuesArr = Object.keys(venues).map((v) => ({venue : v, checkins : venues[v]}))

		venuesArr.sort(function(a, b){
			if(a.checkins.length < b.checkins.length)
				return 1;
			else if (a.checkins.length > b.checkins.length)
				return -1;
			return 0;
		})

		return venuesArr;

		this.setState(_.extend({}, this.state, {
			venues : venuesArr
		}))
	}

	updateData = () => {
		this.setState(_.extend({}, this.state, {
			venues : this.getVenuesArr()
		}))
	}

	componentWillMount(){
		DataStore.on('new-data', this.updateData);
	}

	componentWillUnmount(){
		DataStore.removeListener('new-data', this.updateData)
	}

	constructor(){
		super();	
		this.state = {
			data : DataStore.getFeedData(),
			venues : this.getVenuesArr()
		}
	}

	render(){
		return(
			<div class="container">
				<h3 class="text-center">
					Total Checkins by Venue
				</h3>
				<Table striped bordered condensed hover>
				    <thead>
				      	<tr>
				        	<th>Rank</th>
				        	<th>Venue</th>
				        	<th>Checkins</th>
				      	</tr>
				    </thead>
				    <tbody>
				    {
				    	this.state.venues.map((obj, i) => 
				    		<tr key={i}>
				    			<td>{i+1}</td>
								<td>
									<a 
										onClick={() => {
											this.props.history.pushState({
												pos : {lat : obj.checkins[0].lat, lng : obj.checkins[0].lon},
												venue : obj.venue
											}, 'map')
										}}
									>
										{obj.venue}
									</a>
								</td>
				    			<td>{obj.venue}</td>
				    			<td>{obj.checkins.length}</td>
				    		</tr>
				    	)
				    }
				    </tbody>
				</Table>
			</div>
		)
	}
}