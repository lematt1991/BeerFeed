import React, {Component} from 'react';
import * as _ from 'lodash'
import { SafeAnchor } from 'react-bootstrap';
import { push } from 'react-router-redux'

export default class FeedRow extends Component{
	constructor(props){
		super(props);
		this.state = {
			picSrc : props.beer.pic,
			error : false
		}
	}

	toMap = (venueID) => {
		this.props.dispatch(push({
			pathname : `/map/${venueID}`,
		}))
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
		date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
		var beerLink = `https://untappd.com/b/${this.props.beer.slug}/${this.props.bid}`
		return(	
			<div className="media">
				<div className="media-left media-middle">
					<img
						alt='' 
						onError={this.handleError}
						style={{marginTop : '12px'}} 
						src={this.state.picSrc} 
						width="100" 
						height="100" 
						className="media-photo"
					/>
				</div>
				<div className="media-body">
					<span className="media-meta pull-right">{date.toLocaleString([], dateFormat)}</span>
					<h4 className="title">
						Brewery: {this.props.brewery}
					</h4>
					<h4>
						Beer: <a target="_blank" href={beerLink}>{this.props.beer.name}</a>
					</h4>
					<h4>
						Score: {this.props.beer.rating}
					</h4>
					<h4>	
						Found at: <SafeAnchor id='goto-map'
									onClick={() => this.toMap(this.props.venue_id)}>{this.props.venue}</SafeAnchor>
					</h4>
					<h4>
						Number of checkins: {this.props.checkin_count}
					</h4>
					<h4>
						Style: {this.props.beer.style}
					</h4>
				</div>
			</div>
		);
	}
}