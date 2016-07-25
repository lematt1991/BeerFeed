import React, {Component} from 'react';
import { Map, TileLayer, Marker, Popup} from 'react-leaflet';
var L = require('leaflet');
var util = require('util')

export default class BeerMap extends Component{

	_fetchData(){
		$.get('http://beerfeed-ml9951.rhcloud.com/Beers/rochester_feed').then(
			function(data){
				this.setState({rows : data.venues, lastID : data.lastID})
			}.bind(this)
		)
	}

	_getLocation(){
		if (navigator.geolocation) {
	        navigator.geolocation.getCurrentPosition(function(position){
	        	this.setState({rows : this.state.rows, lastID : this.state.lastID, 
	        				  position : [position.coords.latitude, position.coords.longitude]})
	        }.bind(this));
	    }
	}

	constructor(props){
		super(props);
		console.log(this)
		var initPos = this.props.location.state ? this.props.location.state.pos : [43.1558, -77.5909];
		console.log(initPos)
		this.state = {rows : [], lastID : 0, position : initPos};
		this._fetchData();
		if(!this.props.location.state)
			this._getLocation();
	}

	componentDidUpdate() {
	  	this.map = this.refs.map.leafletElement;
	  	this.state.rows.map(function(row){
    		var marker = L.marker([row.coordinate.latitude, row.coordinate.longitude]);
    		marker.addTo(this.map);

    		var popupText = util.format('<b>%s</b>', row.venue)
    		for(var i = 0; i < row.beers.length; i++){
    			var beer = row.beers[i];
    			popupText += util.format('<br>%s: %s - %d', beer.brewery, beer.name, beer.rating)
    		}

    		marker.bindPopup(popupText);
    		if(this.props.location.state && row.venue == this.props.location.state.venue){
    			marker.openPopup();
    		}
    	}.bind(this));
	}

	render(){
		const cover = {position: 'absolute', left: 0, right: 0, top: 50, bottom: 0};
		return(
			<div>
				<Map center={this.state.position} zoom={14} style={cover} ref="map">
		            <TileLayer
		              url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
		              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		            />
	          	</Map>
	        </div>
		);
	}
}