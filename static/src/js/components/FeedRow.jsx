import React, {Component} from 'react';
import * as _ from 'lodash'
import {SafeAnchor} from 'react-bootstrap';

export default class FeedRow extends Component{
	constructor(props){
		super(props);
		this.state = {
			picSrc : props.pic,
			error : false
		}
	}

	toMap = (venueID) => {
		this.context.router.push({
			pathname : '/map',
			query : {venue : venueID}
		})
	}

	handleError = () => {
		if(!this.state.error){
			this.setState(_.extend({}, this.state, {
				picSrc : 'https://untappd.akamaized.net/site/assets/images/temp/badge-beer-default.png',
				error : true
			}))
		}
	}

	render(){
		var dateFormat = {
			year : '2-digit',
			month : '2-digit',
			day : '2-digit',
			hour : '2-digit',
			minute : '2-digit'
		}
		var date = new Date(this.props.created)
		date.setMinutes(date.getMinutes() - date.getTimezoneOffset()) //convert from UTC to local timezone
		date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
		var beerLink = `https://untappd.com/b/${this.props.beer_slug}/${this.props.bid}`
		return(	
			<div class="media">
				
					<img 
						onError={this.handleError}
						style={{marginTop : '12px'}} 
						src={this.state.picSrc} 
						width="100" 
						height="100" 
						class="pull-left media-photo beer-image"
					/>
				<div class="media-body">
					<span class="media-meta pull-right">{date.toLocaleString([], dateFormat)}</span>
					<h4 class="title">
						Brewery: {this.props.brewery}
					</h4>
					<h4>
						Beer: <a target="_blank" href={beerLink}>{this.props.name}</a>
					</h4>
					<h4>
						Score: {this.props.rating}
					</h4>
					<h4>	
						Found at: <SafeAnchor id='goto-map'
									onClick={() => this.toMap(this.props.venue_id)}>{this.props.venue}</SafeAnchor>
					</h4>
					<h4>
						Number of checkins: {this.props.checkin_count}
					</h4>
				</div>
			</div>
		);
	}
}

FeedRow.contextTypes = {
	router: React.PropTypes.object.isRequired
}