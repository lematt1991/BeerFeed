import React, {Component} from 'react';
import {connect} from 'react-redux'
import { withGoogleMap, GoogleMap, Marker, InfoWindow } from "react-google-maps";

function genInfoWindow(venue){
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

const GMap = withGoogleMap(props => (
	<GoogleMap
    ref={props.onMapLoad}
    defaultZoom={props.defaultZoom}
    defaultCenter={props.defaultCenter}
  >
    {props.markers.map((marker, index) => (
      <Marker {...marker}>
      {
      	marker.key === props.activeMarker ? 
      	<InfoWindow>
					<span>
						<b>{marker.marker.venue}</b>
						{genInfoWindow(marker.marker)}
					</span>
      	</InfoWindow> : null
      }
      </Marker>
    ))}
  </GoogleMap>
))

class BeerMap extends Component{
	constructor(props){
		super(props);

		const search = props.location.search;
		const params = new URLSearchParams(search);

		const dfltPos = {lat : 40.789, lon : -73.9479}
		const feed = this.props.feeds[this.props.currentFeed] || dfltPos

		var state = {
			position : {lat : feed.lat, lng : feed.lon},
			currentPopup : null
		}

		if(this.props.match.params.venue_id){
			state.currentPopup = this.props.match.params.venue_id;
		}else if(params.get('venue')){
			state.currentPopup = params.get('venue');
		}
		
		this.state = state
	}

	handleClick = (popup) => () => {
		if(this.state.currentPopup !== popup){
			if(this.props.data[popup]){
				var pos = {
					lat : this.props.data[popup].lat,
					lng : this.props.data[popup].lon
				}
				this.map.panTo(pos)
				this.setState({...this.state, position : pos, currentPopup : popup})
			}
		}else{
			this.setState({...this.state, currentPopup : null})
		}
	}

	render(){
		const markers = Object.keys(this.props.data).map(k => ({
			key : k,
			visible : true,
			position : {
				lat : this.props.data[k].lat, 
				lng : this.props.data[k].lon
			},
			onClick : this.handleClick(k),
			marker : this.props.data[k]
		}))

		const mapProps = {
			defaultZoom : 15,
			defaultCenter : this.state.position,
			markers : markers,
			onMapLoad : map => {this.map = map; },
			containerElement : <div style={{ height: '100%', width : '100%' }} />,
	    mapElement: <div style={{ height: '100%', width : '100%' }} />,
	    onMapClick: () => {},
	    activeMarker : this.state.currentPopup
		}
		return(
			<div style={{position : 'absolute', top : 0, right : 0, bottom : 0, left : 0}}>
				<GMap {...mapProps}/>
      </div>
		);
	}
}

const mapStateToProps = state => ({
	feeds : state.settings.feeds,
	currentFeed : state.settings.currentFeed,
	data : state.data.mapData,
	router : state.router
})

const mapDispatchToProps = dispatch => ({})

export default connect(mapStateToProps, mapDispatchToProps)(BeerMap)
