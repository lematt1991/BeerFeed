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

class Auth extends React.Component{
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

	login = () => {
		//TODO: login
	}

	render(){
		return(
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<View style={styles.container}>

						<Text style={{fontSize : 24, fontWeight : 'bold', marginBottom : 20}}>
							Login with Untappd
						</Text>

						<Image
							style={styles.image}
							source={require('../assets/Beer.png')}
						/>

						<Button
							style={{width : '80%', marginTop : 20}}
						  icon={{name: 'account-box'}}
						  title='Login' 
						  backgroundColor='rgb(223,158,58)'
						  onPress={this.login}
						 />

						 <ActivityIndicator
						 	style={{marginTop : 10}}
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

export default connect(mapStateToProps, mapDispatchToProps)(Auth);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems : 'center',
    justifyContent : 'center',
    backgroundColor: '#fff',
    padding: 30
  },
  image : {
  	height : 200,
  	width : 200
  }
});
