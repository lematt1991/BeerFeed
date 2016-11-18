import React, {Component} from 'react';
import SettingsStore from '../stores/SettingsStore';
import LocationStore from '../stores/LocationStore'
import DataStore from '../stores/DataStore';
import {GoogleMapLoader, GoogleMap, Marker, InfoWindow} from "react-google-maps";

var _ = require('underscore')

const KEY='AIzaSyCsDj1rbaXeCe64Unrsu168VoNstG_3ItA';

export default class BeerMap extends Component{
	updateData = () => {
		var feed = SettingsStore.getCurrentFeed()
		var feeds = this.state.feeds
		this.setState(_.extend({}, this.state, {
			rows : DataStore.getMapData(),
			currentPopup : feed === this.state.currentFeed ? this.state.currentPopup : undefined,
			currentFeed : feed,
			changeLoc : feed === this.state.currentFeed,
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
		this.state = {
			rows : DataStore.getMapData(), 
			position : initPos, 
			currentFeed : currentFeed,
			feeds : feeds,
			changeLoc : true,
			currentPopup : state ? state.venue : undefined
		};
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
		LocationStore.getLocationPromise().then((loc) => {
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
			        				<b>{k}</b>
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






