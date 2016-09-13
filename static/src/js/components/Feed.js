import React, {Component} from 'react';
const util = require('util');
import {Link} from 'react-router';
import settingsStore from '../stores/SettingsStore';
var _ = require('underscore')
import {Button, Alert} from 'react-bootstrap';

export default class Feed extends Component{
	_fetchData(){
		var user = this.state.currentFeed;
		$.get('http://beerfeed-ml9951.rhcloud.com/Feed?user=' + user).then(
			(data) => {
				this.setState(_.extend({}, this.state, {
					rows:data.checkins,
					lastID : data.lastID
				}));
			}
		)
	}

	updateFeed(){
		var currentFeed = settingsStore.getCurrentFeed()
		$.get('http://beerfeed-ml9951.rhcloud.com/Feed?user=' + currentFeed).then(
			(data) => {
				this.setState(_.extend({}, this.state, {
					rows:data.checkins,
					lastID : data.lastID,
					currentFeed : currentFeed,
				}));
			}
		)
  	}

	componentWillMount() {
    	this.loadInterval = setInterval(this._fetchData.bind(this), 5000);
    	var feeds = settingsStore.getFeeds()
	    settingsStore.on('change', this.updateFeed);
	}

	componentWillUnmount () {
	    this.loadInterval && clearInterval(this.loadInterval);
	    this.loadInterval = false;
	    settingsStore.removeListener('change', this.updateFeed)
	}

	constructor(props){
		super(props)
		this.updateFeed = this.updateFeed.bind(this)
		var feeds = settingsStore.getFeeds();
		this.state = {
			rows : [], 
			lastID : 0, 
			currentFeed : settingsStore.getCurrentFeed(),
			feeds : feeds,
			showAlert : props.location.query.thanks === 'true',
			numRows : 40
		};

		this._fetchData();
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

	_showPosition(pos){
		console.log(pos)
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