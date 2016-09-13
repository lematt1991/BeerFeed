import React, {Component} from 'react';
import settingsStore from '../stores/SettingsStore';
import locationStore from '../stores/LocationStore'
import {GoogleMapLoader, GoogleMap, Marker, InfoWindow} from "react-google-maps";

var _ = require('underscore')

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

	changeFeed(){
		var currentFeed = settingsStore.getCurrentFeed()
		var feeds = this.state.feeds;
		$.get('http://beerfeed-ml9951.rhcloud.com/Beers/' + currentFeed).then(
			(data) => {
				this.setState(_.extend({}, this.state, {
					rows : data.venues,
					lastID : data.lastID,
					currentPopup : undefined,
					currentFeed : currentFeed,
					changeLoc : true,
					position : {
						lat : feeds[currentFeed].coordinates[0],	
					   	lng : feeds[currentFeed].coordinates[1]
					},
				}))
			}
		)
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
			changeLoc : true,
			currentPopup : state ? state.venue : undefined
		};
		this._fetchData();
	}

	_handleClick(e){
		e = e === this.state.currentPopup ? undefined : e
		this.setState(_.extend({}, this.state, {currentPopup : e, changeLoc : false}))
	}

	_onClose(){
		this.setState(_.extend({}, this.state, {
			changeLoc : false,
			currentPopup : undefined,
		}))
	}

	gotoMyLoc = (event) => {
		locationStore.getLocationPromise().then((loc) => {
			this.setState(_.extend({}, this.state, {position : loc}))
		})
		console.log('going to my location')
	}

	render(){
		const cover = {position: 'absolute', left: 0, right: 0, top: 50, bottom: 0};
		const mapProps = 
			this.state.changeLoc ? {defaultZoom : 15, center : this.state.position} : {defaultZoom : 15}
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
			        <GoogleMap {...mapProps}>
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
		            <div style={styles.locButton} onClick={this.gotoMyLoc}>
		            	My Location
		            </div>
		          	</GoogleMap>
		        }/>
		      </div>
		);
	}
}

const styles = {
	locButton : {
		position : 'absolute',
		top : 10,
		right : '2%',
		fontFamily : 'Roboto,Arial,sans-serif',
		fontSize : '14px',
		lineHeight : '25px',
		color : 'rgb(25, 25, 25)',
		zIndex : 2,
		backgroundColor : '#fff',
		border : '2px solid #fff',
		borderRadius : '3px',
		boxShadow : '0 2px 6px rgba(0,0,0,.3)',
		cursor : 'pointer',
		marginBottom : '22px',
		textAlign : 'center',
	}
}






