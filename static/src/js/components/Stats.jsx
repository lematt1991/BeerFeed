import React from 'react';
import DataStore from 'beerfeed/stores/DataStore';
import * as _ from 'lodash';
import {SafeAnchor} from 'react-bootstrap';
import {Table} from 'react-bootstrap';
import * as SearchActions from 'beerfeed/actions/SearchActions';

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
	}

	getBreweryArr = () => {
		var data = DataStore.getFeedData();
		var breweries = {}
		for(var i = 0; i < data.length; i++){
			if(breweries[data[i].brewery]){
				breweries[data[i].brewery].push(data[i]);
			}else{
				breweries[data[i].brewery] = [data[i]];
			}
		}

		var breweryArr = Object.keys(breweries).map(b => ({brewery : b, checkins : breweries[b]}));

		breweryArr.sort((a, b) => {
			if(a.checkins.length < b.checkins.length)
				return 1;
			else if (a.checkins.length > b.checkins.length)
				return -1;
			return 0;
		})
		return breweryArr;
	}

	updateData = () => {
		this.setState(_.extend({}, this.state, {
			venues : this.getVenuesArr(),
			breweries : this.getBreweryArr(),
			topCheckins : DataStore.getTopCheckins()
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
			venues : this.getVenuesArr(),
			breweries : this.getBreweryArr(),
			topCheckins : DataStore.getTopCheckins()
		}
	}

	render(){
		return(
			<div class="container">
				<div class="row">
					<h3 class="text-center">
						Top Checkins
					</h3>
				</div>
				<div class="row" style={{height : 300}}>
					<div class="col-md-3"></div>
					<div class="col-md-6">
						<table class="table table-striped">
						    <thead>
						      	<tr style={{display : 'inline-table', width : '100%', textAlign : 'left'}}>
						        	<th class="col-xs-2">Beer</th>
						        	<th class="col-xs-2">Brewery</th>
						        	<th class="cols-xs-2">Venue</th>
						        	<th class="cols-xs-2"># Checkins</th>
						        	<th class="cols-xs-2">Rating</th>
						        	<th class="col-xs-2">Last Checkin</th>
						      	</tr>
						    </thead>
						    <tbody style={{overflowY: 'scroll', height : 250, position : 'absolute', width : '100%'}}>
						    {

						    	this.state.topCheckins.map((obj, i) => 
						    		<tr key={i} style={{display : 'inline-table', width : '100%', textAlign : 'left'}}>
						    			<td class="col-xs-2">{obj.beer}</td>
						    			<td class="col-xs-2">{obj.brewery}</td>
						    			<td class="col-xs-2">{obj.venue}</td>
						    			<td class="col-xs-2">{obj.numCheckins}</td>
						    			<td class="col-xs-2">{obj.rating}</td>
						    			<td class="col-xs-2">{obj.lastCheckin.toLocaleString()}</td>
						    		</tr>
						    	)
						    }
						    </tbody>
						</table>
					</div>
				</div>

				<div class="row">
					<h3 class="text-center">
						Total Checkins by Venue
					</h3>
				</div>
				<div class="row" style={{height : 300}}>
					<div class="col-md-3"></div>
					<div class="col-md-6">
						<table class="table table-striped">
						    <thead>
						      	<tr style={{display : 'inline-table', width : '100%', textAlign : 'left'}}>
						        	<th class="col-xs-2">Rank</th>
						        	<th class="col-xs-2">Venue</th>
						        	<th class="col-xs-2">Checkins</th>
						      	</tr>
						    </thead>
						    <tbody style={{overflowY: 'scroll', height : 250, position : 'absolute', width : '100%'}}>
						    {
						    	this.state.venues.map((obj, i) => 
						    		<tr key={i} style={{display : 'inline-table', width : '100%', textAlign : 'left'}}>
						    			<td class="col-xs-2">{i+1}</td>
										<td class="col-xs-2">
											<SafeAnchor
												onClick={() => {
													this.props.history.pushState({
														pos : {lat : obj.checkins[0].lat, lng : obj.checkins[0].lon},
														venue : obj.venue
													}, 'map')
												}}
											>
												{obj.venue}
											</SafeAnchor>
										</td>
						    			<td class="col-xs-2">{obj.checkins.length}</td>
						    		</tr>
						    	)
						    }
						    </tbody>
						</table>
					</div>
				</div>

				<div class="row">
					<h3 class="text-center">
						Total Checkins by Brewery
					</h3>
				</div>
				<div class="row" style={{height : 300}}>
				<div class="col-md-3"></div>
				<div class="col-md-6">
					<table class="table table-striped">
					    <thead>
					      	<tr style={{display : 'inline-table', width : '100%', textAlign : 'left'}}>
					        	<th class="col-xs-2">Rank</th>
					        	<th class="col-xs-2">Brewery</th>
					        	<th class="col-xs-2">Checkins</th>
					      	</tr>
					    </thead>
					    <tbody style={{overflowY: 'scroll', height : 250, position : 'absolute', width : '100%'}}>
					    {
					    	this.state.breweries.map((obj, i) => 
					    		<tr key={i} style={{display : 'inline-table', width : '100%', textAlign : 'left'}}>
					    			<td class="col-xs-2">{i+1}</td>
									<td class="col-xs-2">			
										<SafeAnchor
											onClick={() => {
												SearchActions.changeSearchTerm(obj.brewery)
												this.props.history.push('feed')
											}}
										>
											{obj.brewery}
										</SafeAnchor>
									</td>
					    			<td class="col-xs-2">{obj.checkins.length}</td>
					    		</tr>
					    	)
					    }
					    </tbody>
					</table>
				</div>
				</div>
				<div style={{height : 100}}></div>
			</div>
		)
	}
}