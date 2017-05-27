import React from 'react'
import {View, Text, StyleSheet, Image, Linking, Alert} from 'react-native'
import MapView from 'react-native-maps';
import { connect } from 'react-redux'
import * as LocationActions from '../actions/LocationActions'
import {getLocation} from '../Init'
import {Button} from 'react-native-elements'

const Callout = ({venue, beers, lat, lon}) => {
	const text = Object.keys(beers).map(k => 
		`${beers[k].brewery}: ${beers[k].name} (${beers[k].rating})`
	).join('\n')

	const getDirections = () => {
		const url = `http://maps.google.com/maps?daddr=${lat},${lon}`
		Linking.canOpenURL(url).then(supported => {
			if(supported){
				Linking.openURL(url)
			}else{
				alert('Linking not suppored!')
			}
		})
	}

	const alertDirections = () => {
		Alert.alert(
			'Would you like directions?',
			null,
			[
				{text : 'Yes', onPress: getDirections},
				{text : 'No'}
			]
		)
	}

	return(
		<MapView.Callout onPress={alertDirections}>
			<View>
				<Text style={styles.calloutTitle}>{venue}</Text>
				<Text style={styles.calloutText}>{text}</Text>
			</View>
		</MapView.Callout>
	)
}

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

	//TODO: add button to get directions
	renderDescription = venue => {
		return(
			Object.keys(venue.beers).map(k => {
				var beer = venue.beers[k]
				return `${beer.brewery}: ${beer.name} (${beer.rating})`
			}).join('\n')
		)
	}

	moveToLocation = () => {
		var that = this;
		this.map.animateToRegion({
			...this.props.homeLocation,
			latitudeDelta : this.props.location.latitudeDelta,
			longitudeDelta : this.props.location.longitudeDelta
		})
	}

	componentWillReceiveProps(nextProps){
		const {location} = nextProps.navigation.state.params || {};
		if(location){
			nextProps.navigation.setParams({location : null})
			const action = {
				...nextProps.location,
				...location
			};
			this.map.animateToRegion(action)
		}
	}

	onRegionChange = (region) => {
		console.log(region)
		this.props.dispatch(LocationActions.setLocation(region))
	}

	render(){
		return(
			<View style={{position : 'absolute', top : 0, bottom : 0, left : 0, right : 0}}>
				<View style={styles.button}>
					<Button
						buttonStyle={{borderRadius : 10, backgroundColor : '#fff'}}
            onPress={this.moveToLocation}
            title="My Location"
            textStyle={{textAlign : 'center', color : 'black'}}
          />
        </View>
				<MapView
					style={{position : 'absolute', top : 0, bottom : 0, left : 0, right : 0}}
					showsUserLocation={true}
					ref={map => {this.map = map;}}
					initialRegion={this.props.location}
					provider={MapView.PROVIDER_GOOGLE}
					onRegionChangeComplete={this.onRegionChange}
				>
					

				{
					/*TODO: determinate color based on quality of venue*/
					Object.keys(this.props.mapData).map(venue_id => 
						<MapView.Marker
							key={venue_id}
							pinColor='red' 
							title={this.props.mapData[venue_id].venue || 'Missing Title!'}
							description={this.renderDescription(this.props.mapData[venue_id]) || 'Missing description'}
							coordinate = {{
								latitude : this.props.mapData[venue_id].lat, 
								longitude : this.props.mapData[venue_id].lon
							}}
						>
							<Callout {...this.props.mapData[venue_id]} />
						</MapView.Marker>
					)
				}
				</MapView>
			</View>
		)
	}
}

const mapStateToProps = state => ({
	location : state.location.currentLocation,
	homeLocation : state.location.homeLocation,
	mapData : state.data.mapData
})

const mapDispatchToProps = dispatch => ({dispatch})

export default connect(mapStateToProps, mapDispatchToProps)(BeerMap);

const styles = StyleSheet.create({
	directions : {
		marginTop : 10,
		width : 100,
		borderRadius : 10
	},
	button : {
		width : 150,
		position : 'absolute',
		left : 10,
		top : 25,
		zIndex : 5000
	},
	calloutTitle : {
		fontSize : 16,
		fontWeight : 'bold',
	},
	calloutText : {
		fontSize : 12
	},
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
