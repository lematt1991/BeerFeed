import React from 'react'
import {
	View, 
	Text, 
	StyleSheet, 
	Picker, 
	Image, 
	Dimensions,
	Keyboard,
	TouchableWithoutFeedback
} from 'react-native'
import {connect} from 'react-redux'
import t from 'tcomb-form-native'

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

	clickView = () => {
		console.log('Settings view clicked!	')
	}

	render(){
		const feeds = {};
		Object.keys(this.props.feeds).forEach(key => {
			feeds[key] = this.props.feeds[key].city
		})

		const Settings_t = t.struct({
			selectedFeed : t.enums(feeds),
			minNumberOfCheckins : t.Number,
		})

		return(
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<View style={styles.container}>
					<Text style={{fontSize : 30, fontWeight : 'bold', marginTop : 50, marginBottom : 30}}>
						Settings
					</Text>

					<t.form.Form
						ref='form'
						type={Settings_t}
						value={this.props.formValues}
					/>
	      </View>
      </TouchableWithoutFeedback>
		)
	}
}

const mapStateToProps = state => ({
	formValues : {
		selectedFeed : state.settings.currentFeed,
		minNumberOfCheckins : state.settings.checkin_count_threshold
	},
	feeds : state.settings.feeds
})
const mapDispatchToProps = dispatch => ({

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
