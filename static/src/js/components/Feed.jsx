import React, {Component} from 'react';
const util = require('util');
import {Link} from 'react-router';
import settingsStore from '../stores/SettingsStore';
import dataStore from '../stores/DataStore';
var _ = require('underscore')
import {Button, Alert} from 'react-bootstrap';

export default class Feed extends Component{
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

	componentWillMount() {
	    settingsStore.on('change', this.updateFeed);
	    dataStore.on('new-data', this.updateData);
	}

	componentWillUnmount () {
	    settingsStore.removeListener('change', this.updateFeed)
	    dataStore.removeListener('new-data', this.updateData)
	}

	constructor(props){
		super(props)
		var feeds = settingsStore.getFeeds();
		this.state = {
			rows : dataStore.getFeedData(), 
			currentFeed : settingsStore.getCurrentFeed(),
			feeds : feeds,
			showAlert : props.location.query.thanks === 'true',
			numRows : 40
		};
	}

	_renderRow(row){
		var date = new Date(row.created)
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
								Beer: {row.name}
							</h4>
							<h4>
								Score: {row.rating}
							</h4>
							<h4>	
								Found at: <a onClick={() => this.props.history.pushState({pos : {lat:row.lat, lng:row.lon}, venue : row.venue}, 'map')}>{row.venue}</a>
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

	_genMoreButton(){
		if(this.state.numRows < this.state.rows.length){
			return(
				<div class="col-md-12 center-block">
				    <Button onClick={this._showMore.bind(this)} 
				    		class="btn btn-primary center-block">
				       	Show More
				    </Button>
				</div>
			)
		}
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

	render(){
		var locName = this.state.feeds[this.state.currentFeed].name
		return(
			<div class="container-fluid">
				<div class="row">
					
					<section class="content">
						<div class="col-md-8 col-md-offset-2">
							{this._mkAlert()}
							<h1 class="text-center">Beer Feed for {locName}</h1>
							<div class="panel panel-default">
								<div class="panel-body">
									<div class="table-container">
										<table class="table table-filter">
											<tbody>
												{
													this.state.rows.slice(0, this.state.numRows).map(this._renderRow.bind(this))
												}
											</tbody>

										</table>
										{this._genMoreButton()}
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