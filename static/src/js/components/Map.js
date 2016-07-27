import React, {Component} from 'react';
import { Map, TileLayer,  Popup} from 'react-leaflet';
var L = require('leaflet');
var util = require('util')
import settingsStore from '../stores/SettingsStore';
import {GoogleMapLoader, GoogleMap, Marker, InfoWindow} from "react-google-maps";
import MapMarker from './Marker';


export default class BeerMap extends Component{

	_fetchData(){
		$.get('http://beerfeed-ml9951.rhcloud.com/Beers/' + this.state.currentFeed).then(
			function(data){
				this.setState({
					rows : data.venues, 
					lastID : data.lastID, 
					currentFeed : this.state.currentFeed,
					position : this.state.position,
					currentPopup : undefined
				})
			}.bind(this)
		)
	}

	_getLocation(){
		if (navigator.geolocation) {
	        navigator.geolocation.getCurrentPosition(function(position){
	        	this.setState({rows : this.state.rows, lastID : this.state.lastID, 
	        				   currentFeed : this.state.feed, feeds : this.state.feeds,
	        				   currentPopup : this.state.currentPopup,
	        				  position : {lat:position.coords.latitude, lng:position.coords.longitude}})
	        }.bind(this));
	    }
	}

	changeFeed(){
		this.setState({
			rows : this.state.rows,
			lastID : this.state.lastID,
			position : this.state.position,
			feeds : this.state.feeds,
			currentPopup : undefined,
			currentFeed : settingsStore.getCurrentFeed()
		})
	}

	componentWillMount(){
		settingsStore.on('change', this.changeFeed);
	}

	componentWillUnmount(){
		settingsStore.removeListener('change', this.changeFeed)
	}

	constructor(props){
		super(props);
		this.changeFeed = this.changeFeed.bind(this);
		var feeds = settingsStore.getFeeds()
		var currentFeed = settingsStore.getCurrentFeed()
		var initPos = this.props.location.state ? 
					  this.props.location.state.pos : 
					  {lat : feeds[currentFeed].coordinates[0],	
					    lng : feeds[currentFeed].coordinates[1]};
		this.state = {
			rows : [], lastID : 0, 
			position : initPos, 
			currentFeed : currentFeed,
			feeds : feeds,
			currentPopup : undefined
		};
		this._fetchData();
		//if(!this.props.location.state)
			//this._getLocation();
	}

	_handleClick(e){
		e = e === this.state.currentPopup ? undefined : e
		this.setState({
			row : this.state.rows, lastID : this.state.lastID,
			position : this.state.position, currentFeed : this.state.currentFeed,
			feeds : this.state.feeds, currentPopup : e
		})
	}

	_onClose(){
		this.setState({
			row : this.state.rows, lastID : this.state.lastID,
			position : this.state.position, currentFeed : this.state.currentFeed,
			feeds : this.state.feeds, currentPopup : undefined
		})
	}

	render(){
		const cover = {position: 'absolute', left: 0, right: 0, top: 50, bottom: 0};
		return(
			<GoogleMapLoader
		        containerElement={
		          <div
		            style={cover}
		          />
		        }
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
			        				return(
					        			<InfoWindow onCloseclick={this._onClose.bind(this)}>
					        				<div>
					        				<b>{row.venue}</b>
					        				{
					        					row.beers.map((beer) => 
					        						<p style={{margin : 0}}>{beer.brewery}: {beer.name} ({beer.rating})</p>
					        					)
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
		);
	}
}