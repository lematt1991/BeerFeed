import React, {Component} from 'react';
const util = require('util');
import {Link} from 'react-router';
import feedStore from '../stores/FeedStore';
import settingsStore from '../stores/SettingsStore';

export default class Feed extends Component{
	_fetchData(){
		var user = this.state.currentFeed;
		$.get('http://beerfeed-ml9951.rhcloud.com/Feed?user=' + user).then(
			(data) => this.setState({
				rows : data.checkins, 
				lastID : data.lastID,
				currentFeed : this.state.currentFeed,
				feeds : this.state.feeds
			})
		)
	}

	updateFeed(){
      	this.setState({
      		rows : this.state.rows,
      		lastID : this.state.lastID,
      		currentFeed : settingsStore.getCurrentFeed(),
      		feeds : this.state.feeds,
      	})
      	this._fetchData();
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

	constructor(){
		super()
		this.updateFeed = this.updateFeed.bind(this)
		var feeds = settingsStore.getFeeds();
		this.state = {
			rows : [], 
			lastID : 0, 
			currentFeed : settingsStore.getCurrentFeed(),
			feeds : feeds
		};
		this._fetchData();
	}

	_renderRow(row){
		var date = new Date(row.created)
		var url = util.format('https://www.google.com/maps/preview?z=14&q=loc:%d+%d',row.lat,row.lon);
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
								Found at: <a onClick={() => this.props.history.pushState({pos : [row.lat, row.lon], venue : row.venue}, 'map')}>{row.venue}</a>
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

	render(){
		var locName = this.state.feeds[this.state.currentFeed].name
		return(
			<div class="container-fluid">
				<div class="row">
					<section class="content">
						<div class="col-md-8 col-md-offset-2">
							<h1 class="text-center">Beer Feed for {locName}</h1>
							<div class="panel panel-default">
								<div class="panel-body">
									<div class="table-container">
										<table class="table table-filter">
											<tbody>
												{
													this.state.rows.map(this._renderRow.bind(this))
												}
											</tbody>
										</table>
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