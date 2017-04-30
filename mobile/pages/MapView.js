import React from 'react'
import {View, Text, StyleSheet, Image} from 'react-native'
import { MapView } from 'expo';
import { connect } from 'react-redux'

class BeerMap extends React.Component{
	static navigationOptions = {
		tabBarLabel: 'Map',
		tabBarIcon: ({tintColor}) => (
			<Image
				source={require('../assets/icon_map-o.png')}
				style={styles.icon}
			/>
		)
	}

	renderDescription = venue => {
		return(
			Object.keys(venue.beers).map(k => {
				var beer = venue.beers[k]
				return `${beer.brewery}: ${beer.name} (${beer.rating})`
			}).join('\n')
		)
	}

	render(){
		var region;
		if(this.props.location){
			region = {
				latitude: this.props.location.latitude,
	      longitude: this.props.location.longitude,
	      latitudeDelta: 0.022,
	      longitudeDelta: 0.0121,
			}
		}

		return(
				<MapView
					style={{flex : 1}}
					showsUserLocation={true}
					initialRegion={region}
					provider='google'
				>
				{
					Object.keys(this.props.mapData).map(venue_id => 
						<MapView.Marker
							key={venue_id}
							title={this.props.mapData[venue_id].venue}
							description={this.renderDescription(this.props.mapData[venue_id])}
							coordinate = {{
								latitude : this.props.mapData[venue_id].lat, 
								longitude : this.props.mapData[venue_id].lon
							}}
						/>
					)
				}
				</MapView>
		)
	}
}

const mapStateToProps = state => ({
	location : state.location,
	mapData : state.data.mapData
})

const mapDispatchToProps = dispatch => ({})

export default connect(mapStateToProps, mapDispatchToProps)(BeerMap);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon : {
  	height : 26,
  	width : 26
  }
});
