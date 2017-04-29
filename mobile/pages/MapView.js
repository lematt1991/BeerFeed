import React from 'react'
import {View, Text, StyleSheet, Image} from 'react-native'
import { MapView as RNMapView } from 'expo';
import { connect } from 'react-redux'

class MapView extends React.Component{
	static navigationOptions = {
		tabBarLabel: 'Map',
		tabBarIcon: ({tintColor}) => (
			<Image
				source={require('../assets/icon_map-o.png')}
				style={styles.icon}
			/>
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

		var keys = Object.keys(this.props.mapData);
		console.log(`Creating ${keys.length} markers`)
		return(
				<RNMapView
					style={{flex : 1}}
					showsUserLocation={true}
					initialRegion={region}
				>
				{
					keys.map(venue_id => 
						<RNMapView.Marker
							key={venue_id}
							coordinate={{
								latitude : this.props.mapData[venue_id].lat, 
								longitude : this.props.mapData[venue_id].lon
							}}
						/>
					)
				}
				</RNMapView>
		)
	}
}

const mapStateToProps = state => ({
	location : state.location,
	mapData : state.data.mapData
})

const mapDispatchToProps = dispatch => ({})

export default connect(mapStateToProps, mapDispatchToProps)(MapView);

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
