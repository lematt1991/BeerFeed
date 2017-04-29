import React from 'react'
import {View, Text, StyleSheet, Image} from 'react-native'

class MapView extends React.Component{
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
		return(
			<View style={styles.container}>
				<Text> This is the settings view</Text>
        <Text>Open up App.js to start working on your app!</Text>
        <Text>Changes you make will automatically reload.</Text>
        <Text>Shake your phone to open the developer menu.</Text>
      </View>
		)
	}
}

export default MapView;

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
