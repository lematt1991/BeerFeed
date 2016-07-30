import React, {Component} from 'react';
import { Map, TileLayer,  Popup} from 'react-leaflet';
var L = require('leaflet');
var util = require('util')
import settingsStore from '../stores/SettingsStore';
import {GoogleMapLoader, GoogleMap, Marker, InfoWindow} from "react-google-maps";
import MapMarker from './Marker';
var _ = require('underscore')
import {Button} from 'react-bootstrap';

export default class BeerMap extends Component{

	_fetchData(){
		$.get('http://beerfeed-ml9951.rhcloud.com/Beers/' + this.state.currentFeed).then(
			(data) => {
				this.setState(_.extend({}, this.state, {
					rows : data.venues,
					lastID : data.lastID,
				}))
			}
		)
	}

	_getLocation(){
		if (navigator.geolocation) {
	        navigator.geolocation.getCurrentPosition((position) => {
	        	this.setState(_.extend({}, this.state, {
	        		position : {
	        			lat : position.coords.latitude,
	        			lng : position.coords.longitude
	        		}
	        	}))
	        });
	    }
	}

	changeFeed(){
		this.setState(_.extend({}, this.state, {
			currentPopup : undefined,
			currentFeed : settingsStore.getCurrentFeed()
		}))
	}

	componentWillMount(){
		settingsStore.on('change', this.changeFeed);
	}

	componentWillUnmount(){
		settingsStore.removeListener('change', this.changeFeed)
	}

	_genInfoWindow(beers){
		var used = {};
		return(
			beers.map((beer) => {
				if(used[beer.name] === undefined){
					used[beer.name] = true;
					return(
						<p style={{margin : 0}}>{beer.brewery}: {beer.name} ({beer.rating})</p>
					)
				}
			})
		);
	}

	constructor(props){
		super(props);
		this.changeFeed = this.changeFeed.bind(this);
		var state = this.props.location.state;
		var feeds = settingsStore.getFeeds()
		var currentFeed = settingsStore.getCurrentFeed()
		var initPos = state ? state.pos : 
					  {lat : feeds[currentFeed].coordinates[0],	
					   lng : feeds[currentFeed].coordinates[1]};
		this.state = {
			rows : [], lastID : 0, 
			position : initPos, 
			currentFeed : currentFeed,
			feeds : feeds,
			currentPopup : state ? state.venue : undefined
		};
		this._fetchData();
	}

	_handleClick(e){
		e = e === this.state.currentPopup ? undefined : e
		this.setState(_.extend({}, this.state, {currentPopup : e}))
	}

	_onClose(){
		this.setState(_.extend({}, this.state, {
			currentPopup : undefined
		}))
	}

	render(){
		const cover = {position: 'absolute', left: 0, right: 0, top: 50, bottom: 0};
		return(
			<div>
			<GoogleMapLoader
		        containerElement={
		          <div
		            style={cover}
		          />
		        }
		        key={'AIzaSyAYlCzVosumU9Eo_SdRwfZ-bkjSmJzghpA'}
		        query={{key : 'AIzaSyAYlCzVosumU9Eo_SdRwfZ-bkjSmJzghpA'}}
		        googleMapElement={
			        <GoogleMap
			            defaultZoom={15}
			            defaultCenter={this.state.position}
			        >
			        {
			        	this.state.rows.map((row) => {
			        		return(
			        		<Marker
			        			key={row.venue}
			        			visible={true}
			        			position={{
			        				lat : row.coordinate.latitude,
			        				lng : row.coordinate.longitude
			        			}}
			        			onClick={() => this._handleClick(row.venue)}
			        		>
			        		{(() => {
			        			if(this.state.currentPopup === row.venue){
			        				console.log('Rendering popup')
			        				return(
					        			<InfoWindow onCloseclick={this._onClose.bind(this)}>
					        				<div>
					        				<b>{row.venue}</b>
					        				{
					        					this._genInfoWindow(row.beers)
					        				}
					        				</div>
					        			</InfoWindow>
			        				)
			        			}})()
			        		}

			        		</Marker>
			        		)
			        	})
			        }
		           
		          	</GoogleMap>
		        }
		      />
		      </div>
		);
	}
}


const styles = {
	locButton : {
		position : 'absolute',
		top : 50,
		left : 0,
	}
}