import React, {Component} from 'react';
import * as _ from 'lodash'
import {SafeAnchor} from 'react-bootstrap';


export default class FeedRow extends Component{
	constructor(props){
		super(props);
	}

	render(){
		var date = new Date(this.props.created)
		var beerLink = `https://untappd.com/b/${this.props.beer_slug}/${this.props.bid}`
		return(
			<tr data-status="pagado" key={this.props.checkin_id}>
				<td>
					<div class="media">
						<img style={{marginTop : '12px'}} src={this.props.pic} width="100" height="100" class="pull-left media-photo beer-image"/>
						<div class="media-body">
							<span class="media-meta pull-right">{date.toDateString()}</span>
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
								Found at: <SafeAnchor 
											onClick={() => this.props.history.pushState({pos : {lat:this.props.lat, lng:this.props.lon}, venue : this.props.venue}, 'map/' + this.props.venue_id)}>{this.props.venue}</SafeAnchor>
							</h4>
						</div>
					</div>
				</td>
			</tr>
		);
	}
}