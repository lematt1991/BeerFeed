import React, {Component} from 'react';
import settingsStore from '../stores/SettingsStore';
import searchStore from '../stores/SearchStore';
import dataStore from '../stores/DataStore';
import {Button, Alert, SafeAnchor} from 'react-bootstrap';
import SearchInput, {createFilter} from 'react-search-input'
import Select from 'react-select';
import LocationStore from '../stores/LocationStore';

var _ = require('underscore')

const KEYS_TO_FILTERS = ['brewery', 'name', 'venue']

export default class Feed extends Component{

	static contextTypes = {
		router : React.PropTypes.object.isRequired
	}

	updateFeed = () => {
		this.setState(_.extend({}, this.state, {
			currentFeed : settingsStore.getCurrentFeed()
		}))
  	}

  	updateData = () => {
  		this.setState(_.extend({}, this.state, {
  			rows : dataStore.getFeedData()
  		}))
  	}

  	updateSearchTerm = () => {
  		this.setState(_.extend({}, this.state, {
  			searchTerm : searchStore.getSearchTerm(),
  		}))
  	}

	componentWillMount() {
	    settingsStore.on('change', this.updateFeed);
	    dataStore.on('new-data', this.updateData);
	    searchStore.on('change', this.updateSearchTerm);
	    LocationStore.on('got-location', this.getUserLocation);
	}

	getUserLocation = () => {
		var options = this.state.options.slice()
		options.push({value : 'distance', label : 'Order by Distance', f : this.orderByDistance})
		this.setState(_.extend({}, this.state, {
			options : options,
			location : LocationStore.getLocation()
		}))
	}

	componentWillUnmount () {
	    settingsStore.removeListener('change', this.updateFeed)
	    dataStore.removeListener('new-data', this.updateData)
	    searchStore.removeListener('change', this.updateSearchTerm)
	    LocationStore.removeListener('got-location', this.getUserLocation)
	}

	orderByDate = (x, y) => {
		return x.checkin_id > y.checkin_id ? -1 : 1
	}

	orderByRating = (x, y) => {
		return x.rating > y.rating ? -1 : 1
	}

	orderByDistance = (x, y) => {
		var d1 = Math.pow(x.lat - this.state.location.lat, 2) + Math.pow(x.lon - this.state.location.lng, 2)
		var d2 = Math.pow(y.lat - this.state.location.lat, 2) + Math.pow(y.lon - this.state.location.lng, 2)
		return d1 < d2 ? -1 : 1
	}

	constructor(props){
		super(props)
		var feeds = settingsStore.getFeeds();
		this.state = {
			rows : dataStore.getFeedData(), 
			currentFeed : settingsStore.getCurrentFeed(),
			feeds : feeds,
			showAlert : props.location.query.thanks === 'true',
			numRows : 40,
			ordering : {value : 'date', label : 'Order by Date', f : this.orderByDate},
			searchTerm : searchStore.getSearchTerm(),
			location : LocationStore.getLocation(),
			options : LocationStore.haveUserLocation() ? 
			[
				{value : 'date', label : 'Order by Date', f : this.orderByDate},
				{value : 'rating', label : 'Order by Rating', f : this.orderByRating},
				{value : 'distance', label : 'Order by Distance', f : this.orderByDistance}
			] : [
				{value : 'date', label : 'Order by Date', f : this.orderByDate},
				{value : 'rating', label : 'Order by Rating', f : this.orderByRating}
			]
		};
	}

	_renderRow(row){
		var date = new Date(row.created)
		var beerLink = `https://untappd.com/b/${row.beer_slug}/${row.bid}`
		return(
			<tr data-status="pagado" key={row.checkin_id}>
				<td>
					<div class="media">
						<img style={{marginTop : '12px'}} src={row.pic} width="100" height="100" class="pull-left media-photo beer-image"/>
						<div class="media-body">
							<span class="media-meta pull-right">{date.toDateString()}</span>
							<h4 class="title">
								Brewery: {row.brewery}
							</h4>
							<h4>
								Beer: <a target="_blank" href={beerLink}>{row.name}</a>
							</h4>
							<h4>
								Score: {row.rating}
							</h4>
							<h4>	
								Found at: <SafeAnchor onClick={() => this.props.history.pushState({pos : {lat:row.lat, lng:row.lon}, venue : row.venue}, 'map')}>{row.venue}</SafeAnchor>
							</h4>
						</div>
					</div>
				</td>
			</tr>
		);
	}

	_showMore(event){
		event.target.blur()
		this.setState(_.extend({}, this.state, {
			numRows : this.state.numRows + 40,
		}))
	}

	_mkAlert(){
		if(this.state.showAlert){
			return(
				<Alert bsStyle="warning" onDismiss={() => this.setState(_.extend({}, this.state, {showAlert : false}))}>
		    		<strong>Thanks for linking your Untappd account!</strong>
				</Alert>
			)
		}	
	}

	changeOrdering = (order) => {
		this.setState(_.extend({}, this.state, {
			ordering : order
		}))
	}

	render(){
		var locName = this.state.feeds[this.state.currentFeed].name
		var items = this.state.rows.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS))
		items.sort(this.state.ordering.f)
		console.log('test')
		return(
			<div class="container-fluid">
				<div class="row">
					
					<section class="content">
						<div class="col-md-8 col-md-offset-2">
							{this._mkAlert()}
							<div class="row" style={{display : 'flex', justifyContent : 'center'}}>
								<Select
									style={{width : 150}}
									options={this.state.options}
									clearable={false}
									onChange={this.changeOrdering}
									value={this.state.ordering.value}
								/>
							</div>
							<h1 class="text-center">Beer Feed for {locName}</h1>
							<div class="panel panel-default">
								<div class="panel-body">
									<div class="table-container">
										<table class="table table-filter">
											<tbody>
												{
													items.slice(0, this.state.numRows).map(this._renderRow.bind(this))
												}
											</tbody>

										</table>
										{
											this.state.numRows < items.length ? 
											<div class="col-md-12 center-block">
											    <Button onClick={this._showMore.bind(this)} 
											    		class="btn btn-primary center-block">
											       	Show More
											    </Button>
											</div> : null
										}
									</div>
								</div>
							</div>
						</div>
					</section>
				</div>
			</div>
		);
	}
} 