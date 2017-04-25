import React, {Component} from 'react';
import LocationStore from '../stores/LocationStore'
import DataStore from '../stores/DataStore';
import {GoogleMapLoader, GoogleMap, Marker, InfoWindow} from "react-google-maps";
import * as _ from 'lodash'
import {connect} from 'react-redux'

class BeerMap extends Component{
	updateData = () => {
		const dflt = {lat : 40.789, lon : -73.9479}
		const feed = this.props.feeds[this.props.currentFeed] || dflt
		this.setState(_.extend({}, this.state, {
			rows : DataStore.getMapData(),
			currentPopup : feed === this.state.currentFeed ? this.state.currentPopup : undefined,
			position : {
				lat : feed.lat,
				lng : feed.lon
			}
		}))
	}

	componentWillMount(){
		DataStore.on('new-data', this.updateData);
	}

	componentWillUnmount(){
		DataStore.removeListener('new-data', this.updateData)
	}

	_genInfoWindow(venue){
		return(
			Object.keys(venue.beers).map(k => {
				var beer = venue.beers[k]
				var beerLink = `https://untappd.com/b/${beer.beer_slug}/${beer.bid}`
				return(
					<p style={{margin : 0}} key={k}>
						{beer.brewery}: <a target="_blank" href={beerLink}>{beer.name}</a> ({beer.rating})
					</p>
				)
			})
		);
	}

	constructor(props){
		super(props);
		var state = this.props.location.state;
		const dflt = {lat : 40.789, lon : -73.9479}
		const feed = this.props.feeds[this.props.currentFeed] || dflt

		var initPos = state ? state.pos : 
					  {lat : feed.lat,	
					   lng : feed.lon};

		var popup = null

		if(props.location.query && props.location.query.venue){
			popup = props.location.query.venue
		}else{
			var venue = props.location.pathname.match(/map\/.*/)
			if(venue){
				popup = venue[0].substr(4)
			}
		}

		this.state = {
			position : initPos, 
			currentPopup : popup
		};
	}

	_handleClick(popup){
		if(this.state.currentPopup !== popup){
			if(this.props.data[popup]){
				var pos = {
					lat : this.props.data[popup].lat,
					lng : this.props.data[popup].lon
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
			        	Object.keys(this.props.data).map(k => 
			        		<Marker
			        			key={k}
			        			visible={true}
			        			position={{
			        				lat : this.props.data[k].lat,
			        				lng : this.props.data[k].lon
			        			}}
			        			onClick={() => this._handleClick(k)}
			        		>
			        		{this.state.currentPopup === k ?
			        			<InfoWindow onCloseclick={this._onClose.bind(this)}>
			        				<div>
			        				<b>{this.props.data[k].venue}</b>
			        				{
			        					this._genInfoWindow(this.props.data[k])
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

const mapStateToProps = state => ({
	feeds : state.settings.feeds,
	currentFeed : state.settings.currentFeed,
	data : state.data.mapData
})

const mapDispatchToProps = dispatch => ({})

export default connect(mapStateToProps, mapDispatchToProps)(BeerMap)
