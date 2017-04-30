import React from 'react'
import {View, Text, StyleSheet, Picker, Image, Dimensions} from 'react-native'
import {connect} from 'react-redux'

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

	render(){
		console.log(this.props.settings)
		return(
			<View style={styles.container}>
				<Text style={{fontSize : 30, fontWeight : 'bold', marginTop : 50}}>
					Settings
				</Text>

      </View>
		)
	}
}

const mapStateToProps = state => state
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
    alignItems: 'center',
  },
  icon : {
  	height : 26,
  	width : 26
  }
});
