import React from 'react'
import {View, Text, StyleSheet, Image} from 'react-native'

class ListView extends React.Component{
	static navigationOptions = {
		tabBarLabel: 'Feed',
		tabBarIcon: ({tintColor}) => (
			<Image
				source={require('../assets/icon_rss.png')}
				style={styles.icon}
			/>
		)
	}

	render(){
		return(
			<View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
        <Text>Changes you make will automatically reload.</Text>
        <Text>Shake your phone to open the developer menu.</Text>
      </View>
		)
	}
}

export default ListView;

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
