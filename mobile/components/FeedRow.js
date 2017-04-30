import React from 'react';
import {
	Text,
	StyleSheet,
	View,
	Image
} from 'react-native'

const styles = StyleSheet.create({
	container : {
		flex : 1,
		flexDirection : 'row',
		alignItems : 'center',
		justifyContent: 'flex-start',
		marginBottom : 10
	},
	imageContainer : {
		marginRight : 10
	},
	image : {
		width : 50,
		height : 50
	}
})

export default class FeedRow extends React.Component{
	render(){
		var dateFormat = {
			year : '2-digit',
			month : '2-digit',
			day : '2-digit',
			hour : '2-digit',
			minute : '2-digit'
		}
		var date = new Date(this.props.created)
		date.setMinutes(date.getMinutes() - date.getTimezoneOffset()) //convert from UTC to local timezone
		date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
		var beerLink = `https://untappd.com/b/${this.props.beer_slug}/${this.props.bid}`
		var dateFormat = {
			year : '2-digit',
			month : '2-digit',
			day : '2-digit',
			hour : '2-digit',
			minute : '2-digit'
		}
		var date = new Date(this.props.created)
		date.setMinutes(date.getMinutes() - date.getTimezoneOffset()) //convert from UTC to local timezone
		date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
		return(
			<View style={styles.container}>
				<View style={styles.imageContainer}>	
					<Image 
						source={{uri : this.props.pic}}
						style={styles.image}
						defaultSource={require('../assets/badge-beer-default.png')}
					/>
				</View>
				<View>
					<Text>
						Beer: {this.props.name}
					</Text>
					<Text>
						Brewery: {this.props.brewery}
					</Text>
					<Text>
						Found at: {this.props.venue}
					</Text>
					<Text>
						Rating: {this.props.rating}
					</Text>
					<Text>
						Number of checkins: {this.props.checkin_count}
					</Text>
					<Text>
						Last checked in: {date.toLocaleString([], dateFormat)}
					</Text>
				</View>
			</View>
		)
	}
}

