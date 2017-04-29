import React from 'react'
import {View, Text, StyleSheet} from 'react-native'

class ListView extends React.Component{
	static route = {
		navigationBar : {
			title : 'Feed'
		}
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
});
