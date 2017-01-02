import React from 'react';
import DataStore from 'beerfeed/stores/DataStore';
import * as _ from 'lodash';
import {SafeAnchor} from 'react-bootstrap';
import {Table} from 'react-bootstrap';
import * as SearchActions from 'beerfeed/actions/SearchActions';
import Select from 'react-select';

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

	gotoBrewery = (brewery) => {
		SearchActions.changeSearchTerm(brewery)
		this.context.router.push({
			pathname : 'feed'
		})
	}

	gotoVenue = (venue_id) => {
		this.context.router.push({
			pathname : '/map',
			query : {venue : venue_id}
		})
	}

	constructor(){
		super();	

		var options = [
			{
				label : 'Top Checkins',
				value : 'topCheckins',
				f : obj => (
					<tr key={obj.bid + obj.venue_id}>
						<td>
							<div class="media">
								<div class='media-body'>
									<h5>Brewery: <SafeAnchor onClick={() => this.gotoBrewery(obj.brewery)}>{obj.brewery}</SafeAnchor>
									</h5>
									<h5>Venue: <SafeAnchor onClick={() => this.gotoVenue(obj.venue_id)}>{obj.venue}</SafeAnchor>
									</h5>
									<h5>Beer: <a target='_blank' href={`https://untappd.com/b/${obj.beer_slug}/${obj.bid}`}>{obj.beer}</a>
									</h5>
									<h5>Number of Checkins: {obj.numCheckins}</h5>
									<h5>Rating: {obj.rating}</h5>
									<h5>Last Checked in at: {obj.lastCheckin.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</h5>
								</div>
							</div>
						</td>
					</tr>
				)
			},{
				label : 'Top Venues',
				value : 'venues',
				f : (obj, i) => (
					<tr key={obj.checkins[0].venue_id}>
						<td>
							<div class="media">
								<div class='media-body'>
									<h5>Rank: {i+1}</h5>
									<h5>Venue: <SafeAnchor onClick={() => this.gotoVenue(obj.checkins[0].venue_id)}>{obj.venue}</SafeAnchor></h5>
									<h5>Number of Checkins: {obj.checkins.length}</h5>
								</div>
							</div>
						</td>
					</tr>
				)
			},{
				label : 'Top Breweries',
				value : 'breweries',
				f : (obj, i) => (
					<tr key={obj.checkins[0].brewery}>
						<td>
							<div class="media">
								<div class='media-body'>
									<h5>Rank: {i+1}</h5>
									<h5>Brewery: <SafeAnchor onClick={() => this.gotoBrewery(obj.checkins[0].brewery)}>{obj.checkins[0].brewery}</SafeAnchor></h5>
									<h5>Number of Checkins: {obj.checkins.length}</h5>
								</div>
							</div>
						</td>
					</tr>
				)
			}
		]


		this.state = {
			data : DataStore.getFeedData(),
			venues : this.getVenuesArr(),
			breweries : this.getBreweryArr(),
			topCheckins : DataStore.getTopCheckins(),
			options : options,
			value : options[0]
		}
	}

	handleChange = (option) => {
		this.setState(_.extend({}, this.state, {
			value : option
		}))
	}

	render(){
		return(
			<div class="container">
				<div class="row">
					<div class="col-md-4 col-md-offset-4" style={{paddingBottom : 20}}>
						<Select
							options={this.state.options}
							value={this.state.value.value}
							onChange={this.handleChange}
							clearable={false}
						/>
					</div>
				</div>

				<div class="row">
					<div class="col-md-8 col-md-offset-2">
						<div class="panel panel-default">
							<div class="panel-body">
								<div class="table-container">
									<table class="table table-filter">
										<tbody>
										{this.state[this.state.value.value].map(this.state.value.f)}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div style={{height : 100}}></div>
			</div>
		)
	}
}

Stats.contextTypes = {
	router: React.PropTypes.object.isRequired
}