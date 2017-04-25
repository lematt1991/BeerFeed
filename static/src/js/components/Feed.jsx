import React, {Component} from 'react';
import {Button, Alert, SafeAnchor, FormGroup, FormControl, ControlLabel, Form} from 'react-bootstrap';
import SearchInput, {createFilter} from 'react-search-input'
import Select from 'react-select';
import LocationStore from '../stores/LocationStore';
import FeedRow from '../components/FeedRow'
import * as SettingsActions from '../actions/SettingsActions'
import {connect} from 'react-redux'

const KEYS_TO_FILTER = ['brewery', 'name', 'venue', 'style']

class Feed extends Component{
	componentWillMount() {
	    LocationStore.on('got-location', this.getUserLocation);
	}

	getUserLocation = () => {
		var options = this.state.options.slice()
		options.push({value : 'distance', label : 'Order by Distance', f : this.orderByDistance})
		this.setState({
			...this.state, 
			options : options,
			location : LocationStore.getLocation()
		})
	}

	componentWillUnmount () {
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
		this.state = {
			showAlert : props.location.query.thanks === 'true',
			numRows : 40,
			ordering : {value : 'date', label : 'Order by Date', f : this.orderByDate},
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

	showMore = (event) => {
		event.target.blur()
		this.setState({...this.state, numRows : this.state.numRows + 40})
	}

	_mkAlert(){
		if(this.state.showAlert){
			return(
				<Alert bsStyle="warning" onDismiss={() => this.setState({...this.state, showAlert : false})}>
		    		<strong>Thanks for linking your Untappd account!</strong>
				</Alert>
			)
		}	
	}

	changeOrdering = (order) => {
		this.setState({...this.state, ordering : order})
	}

	changeCheckinFilter = event => {
		this.props.changeCheckinCountThreshold(event.target.value);
	}

	render(){
		const feed = this.props.feeds[this.props.currentFeed] || {}
		var locName = feed.city
		var filter = createFilter(this.props.searchTerm, KEYS_TO_FILTER)
		var count_filter = this.props.checkin_count_threshold || 1
		var items = this.props.rows.filter(r => r.checkin_count >= count_filter && filter(r))
		items.sort(this.state.ordering.f)
		return(
			<div class="container-fluid">
				<div class="row">
					<section class="content">
						<div class="col-md-8 col-md-offset-2">
							{this._mkAlert()}
							<div class="row" style={{display : 'flex', justifyContent : 'center', alignItems : 'center'}}>
								<Select
									style={{width : 150}}
									options={this.state.options}
									clearable={false}
									onChange={this.changeOrdering}
									value={this.state.ordering.value}
								/>
								<div style={{width : 5}}></div>
								<Form inline>
									<FormGroup
					          controlId="num-checkins"
					        >
					          <ControlLabel>Min Checkins:</ControlLabel>
					          <FormControl
					          	style={{width : 75, marginLeft : 5}}
					            type="text"
					            value={this.props.checkin_count_threshold}
					            onChange={this.changeCheckinFilter}
					          />
					          <FormControl.Feedback />
					        </FormGroup>
				        </Form>
							</div>
							<h1 class="text-center">Beer Feed for {locName}</h1>
							<div class="panel panel-default">
								<div class="panel-body">
									<div class="table-container">
										<table class="table table-filter">
											<tbody>
												{
													items.slice(0, this.state.numRows).map(row => 
														<tr data-status="pagado" key={row.checkin_id}><td>
														<FeedRow
															
															{...row}
														/>
														</td></tr>
													)
												}
											</tbody>

										</table>
										{
											this.state.numRows < items.length ? 
											<div class="col-md-12 center-block">
											    <Button onClick={this.showMore} 
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

const mapStateToProps = state => ({
	searchTerm : state.search.searchTerm,
	feeds : state.settings.feeds,
	currentFeed : state.settings.currentFeed,
	checkin_count_threshold : state.settings.checkin_count_threshold,
	rows : state.data.feedData
});

const mapDispatchToProps = dispatch => ({
	changeCheckinCountThreshold : thresh => dispatch(SettingsActions.changeCheckinCountThreshold(thresh))
});

export default connect(mapStateToProps, mapDispatchToProps)(Feed);



