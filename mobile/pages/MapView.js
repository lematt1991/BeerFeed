import React from 'react'
import {View, Text, StyleSheet, Image, Linking, Alert} from 'react-native'
import { MapView } from 'expo';
import { connect } from 'react-redux'
import * as LocationActions from '../actions/LocationActions'
import {getLocation} from '../Init'
import {Button} from 'react-native-elements'

const Callout = ({venue, beers, lat, lon}) => {
	const text = Object.keys(beers).map(k => 
		`${beers[k].brewery}: ${beers[k].beer.name} (${beers[k].beer.rating})`
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

	constructor(props){
		super();
		this.state = {
			location : props.location,
			activeCallout : null
		}
	}

	//TODO: add button to get directions
	renderDescription = venue => {
		return(
			Object.keys(venue.beers).map(k => {
				var beer = venue.beers[k];
				return `${beer.brewery}: ${beer.beer.name} (${beer.beer.rating})`
			}).join('\n')
		)
	}

	moveToLocation = () => {
		var loc = {...this.props.location};
		loc.latitudeDelta = this.state.location.latitudeDelta;
		loc.longitudeDelta = this.state.location.longitudeDelta;
		this.map.animateToRegion(loc);
	}

	componentWillReceiveProps(nextProps){
		const { params } = nextProps.navigation.state;
		if(params){
			this.map.animateToRegion({
				...nextProps.location,
				...params.location
			});
			this.setState({...this.state, activeCallout : `${params.venue_id}`})
		}
	}

	onPan = location => {
		this.setState({location})
	}

	render(){
		return(
			<View style={{flex : 1}}>
				<Button
						buttonStyle={{borderRadius : 10, backgroundColor : '#fff'}}
						containerViewStyle={{position : 'absolute', top : 35, left : 5, height : 50, zIndex : 1000000, width : 125}}
	          onPress={this.moveToLocation}
	          title="My Location"
	          textStyle={{textAlign : 'center', color : 'black'}}
	        />
				<MapView
					style={{position : 'absolute', top : 0, left : 0, right : 0, bottom : 0}}
					showsUserLocation={true}
					ref={map => {this.map = map;}}
					initialRegion={this.props.location}
					provider='google'
					onRegionChangeComplete={this.onPan}
				>
					

				{
					/*TODO: determinate color based on quality of venue*/
					Object.keys(this.props.mapData).map(venue_id => {
						// var marker = this.props.mapData[venue_id];
						// const { minScore, maxScore } = this.props;
						// const ratio = (marker.score - minScore) / (maxScore - minScore);
						// const color = `rgb(${Math.round(255 * ratio)},0,${Math.round(255 * (1-ratio))})`
						
						const { beers } = this.props.mapData[venue_id];
						const count = Object.keys(beers).filter(k => beers[k].checkin_count >= 2).length;
						const ratio = Math.min(count / 5.0, 1.0)
						const color = `rgb(${Math.round(255 * ratio)},0,${Math.round(255 * (1-ratio))})`

						return(
							<MapView.Marker
								showCallout={venue_id === this.state.activeCallout}
								key={venue_id}
								pinColor={color}
								coordinate = {{
									latitude : this.props.mapData[venue_id].lat, 
									longitude : this.props.mapData[venue_id].lon
								}}
							>
								<Callout {...this.props.mapData[venue_id]} />
							</MapView.Marker>
						)
					})
				}
				</MapView>
			</View>
		)
	}
}

const mapStateToProps = state => ({
	location : state.location,
	mapData : state.data.mapData,
	minScore : state.data.minScore,
	maxScore : state.data.maxScore,
})

const mapDispatchToProps = dispatch => ({
	setLocation : location => dispatch(LocationActions.setLocation(location))
})

export default connect(mapStateToProps, mapDispatchToProps)(BeerMap);

const styles = StyleSheet.create({
	directions : {
		marginTop : 10,
		width : 100,
		borderRadius : 10
	},
	button : {
		width : 150,
		marginLeft : 5,
		marginTop : 25
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
