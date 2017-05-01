import React from 'react'
import {
	View, 
	Text, 
	StyleSheet, 
	Picker, 
	Image, 
	Dimensions,
	Keyboard,
	TouchableWithoutFeedback,
	ActivityIndicator
} from 'react-native'
import {connect} from 'react-redux'
import t from 'tcomb-form-native'
import * as SettingsActions from '../actions/SettingsActions'
import * as DataActions from '../actions/DataActions'
import {Button} from 'react-native-elements'

class Settings extends React.Component{
	static navigationOptions = {
		tabBarLabel: 'Settings',
		tabBarIcon: ({tintColor}) => (
			<Image
				source={require('../assets/icon_gear.png')}
				style={styles.icon}
			/>
		)
	}

	constructor(props){
		super(props);
		this.state = {
			fetching : false
		}
	}

	changeValue = ({minNumberOfCheckins, feedOrdering}) => {
		if(minNumberOfCheckins !== this.props.formValues.minNumberOfCheckins){
			this.props.changeCheckinCountThreshold(minNumberOfCheckins)
		}else if(feedOrdering !== this.props.formValues.feedOrdering){
			this.props.changeFeedOrdering(feedOrdering)
		}
	}

	resetCache = () => {
		const feed = this.props.currentFeed;
		this.setState({fetching : true})
		this.props.fetchData(feed)
			.then(() => this.setState({fetching : false}))
	}

	render(){
		const feeds = {};
		Object.keys(this.props.feeds).forEach(key => {
			feeds[key] = this.props.feeds[key].city
		})

		const Settings_t = t.struct({
			// selectedFeed : t.enums(feeds),
			minNumberOfCheckins : t.Number,
			feedOrdering : t.enums({
				date : 'By Date',
				rating : 'By Rating'
			})
		})

		return(
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<View style={styles.container}>
						<Text style={{fontSize : 30, fontWeight : 'bold', marginTop : 30, marginBottom : 30}}>
							Settings
						</Text>

						<t.form.Form
							ref='form'
							onChange={this.changeValue}
							type={Settings_t}
							value={this.props.formValues}
						/>

						<Button
							style={{marginTop : 50, marginBottom : 20}}
						  icon={{name: 'warning'}}
						  title='Reset Cache' 
						  backgroundColor='red'
						  onPress={this.resetCache}
						 />

						 <ActivityIndicator
						 	animating={this.state.fetching}
						 	size="large"
						 />
		      </View>
	      </TouchableWithoutFeedback>
		)
	}
}

const mapStateToProps = state => ({
	formValues : {
		// selectedFeed : state.settings.currentFeed,
		minNumberOfCheckins : state.settings.checkin_count_threshold,
		feedOrdering : state.settings.ordering,
	},
	feeds : state.settings.feeds,
	currentFeed : state.settings.currentFeed
})
const mapDispatchToProps = dispatch => ({
	changeCheckinCountThreshold : thresh => dispatch(SettingsActions.changeCheckinCountThreshold(thresh)),
	changeFeedOrdering : ordering => dispatch(SettingsActions.changeFeedOrdering(ordering)),
	fetchData : feed => dispatch(DataActions.fetchData(feed))
})

export default connect(mapStateToProps, mapDispatchToProps)(Settings);

const styles = StyleSheet.create({
	picker : {
		width : Dimensions.get('window').width
	},
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 30
  },
  icon : {
  	height : 26,
  	width : 26
  }
});
