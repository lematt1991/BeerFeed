import React, {Component} from 'react';
import SettingsStore from 'beerfeed/stores/SettingsStore';
import LocationStore from 'beerfeed/stores/LocationStore'
import DataStore from 'beerfeed/stores/DataStore';
import {GoogleMapLoader, GoogleMap, Marker, InfoWindow} from "react-google-maps";
import * as _ from 'lodash'

export default class BeerMap extends Component{
	updateData = () => {
		var feed = SettingsStore.getCurrentFeed()
		var feeds = this.state.feeds
		this.setState(_.extend({}, this.state, {
			rows : DataStore.getMapData(),
			currentPopup : feed === this.state.currentFeed ? this.state.currentPopup : undefined,
			currentFeed : feed,
			position : {
				lat : feeds[feed].coordinates[0],
				lng : feeds[feed].coordinates[1]
			}
		}))
	}

	componentWillMount(){
		DataStore.on('new-data', this.updateData);
	}

	componentWillUnmount(){
		DataStore.removeListener('new-data', this.updateData)
	}

	_genInfoWindow(beers){
		var used = {};
		return(
			beers.map((beer) => {
				if(used[beer.name] === undefined){
					used[beer.name] = true;
					var beerLink = `https://untappd.com/b/${beer.beer_slug}/${beer.bid}`
					return(
						<p style={{margin : 0}} key={beer.name}>
							{beer.brewery}: <a target="_blank" href={beerLink}>{beer.name}</a> ({beer.rating})
						</p>
					)
				}
			})
		);
	}

	constructor(props){
		super(props);
		var state = this.props.location.state;
		var feeds = SettingsStore.getFeeds()
		var currentFeed = SettingsStore.getCurrentFeed()
		var initPos = state ? state.pos : 
					  {lat : feeds[currentFeed].coordinates[0],	
					   lng : feeds[currentFeed].coordinates[1]};

		var popup = null

		if(props.location.query && props.location.query.venue){
			popup = props.location.query.venue
		}else{
			var venue = props.location.pathname.match(/map\/.*/)
			if(venue){
				popup = venue[0].substr(4)
			}
		}

		var rows = DataStore.getMapData()
		this.state = {
			rows : rows, 
			position : initPos, 
			currentFeed : currentFeed,
			feeds : feeds,
			currentPopup : popup
		};
	}

	_handleClick(popup){
		if(this.state.currentPopup !== popup){
			var rows = this.state.rows
			if(rows[popup]){
				var pos = {
					lat : rows[popup][0].lat,
					lng : rows[popup][0].lon
				}
				this.refs.map.panTo(pos)
				this.setState(_.extend({}, this.state, {
					position : pos,
					currentPopup : popup
				}))
			}
		}else{
			this.setState(_.extend({}, this.state, {
				currentPopup: undefined
			}))
		}
	}

	_onClose(){	
		this.setState(_.extend({}, this.state, {
			currentPopup : undefined,
		}))
	}

	render(){
		const mapProps = {
			defaultZoom : 15,
			defaultCenter : this.state.position
		}
		return(
			<div>
			<GoogleMapLoader
		        containerElement={
		          <div
		            style={{position: 'absolute', left: 0, right: 0, top: 50, bottom: 0}}
		          />
		        }
		        key={'AIzaSyAYlCzVosumU9Eo_SdRwfZ-bkjSmJzghpA'}
		        query={{key : 'AIzaSyAYlCzVosumU9Eo_SdRwfZ-bkjSmJzghpA'}}
		        googleMapElement={
			        <GoogleMap 
			        	ref="map"
			        	{...mapProps}
			        >
			        {
			        	Object.keys(this.state.rows).map(k => 
			        		<Marker
			        			key={k}
			        			visible={true}
			        			position={{
			        				lat : this.state.rows[k][0].lat,
			        				lng : this.state.rows[k][0].lon
			        			}}
			        			onClick={() => this._handleClick(k)}
			        		>
			        		{this.state.currentPopup === k ?
			        			<InfoWindow onCloseclick={this._onClose.bind(this)}>
			        				<div>
			        				<b>{this.state.rows[k][0].venue}</b>
			        				{
			        					this._genInfoWindow(this.state.rows[k])
			        				}
			        				</div>
			        			</InfoWindow> : 
			        			null
			        		}
			        		</Marker>
			        	)
			        }
		          	</GoogleMap>
		        }/>
		      </div>
		);
	}
}

BeerMap.contextTypes = {
	router: React.PropTypes.object.isRequired
}

