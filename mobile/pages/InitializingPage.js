import React from 'react'
import {
	View, 
	Text, 
	StyleSheet, 
	Image,
	FlatList,
	ScrollView
} from 'react-native'


export default class InitializingPage extends React.Component{
	render(){
		return(
			<View style={styles.container}>
				<Text style={styles.text}>
					The Beer Feed
				</Text>
				<Image
					style={styles.image}
					source={require('../assets/Beer.png')}
				/>
      </View>
		)
	}
}


const styles = StyleSheet.create({
	text : {
		fontSize : 32,
		fontWeight : 'bold',

	},
	image : {
		width : 300,
		height : 300,
	},
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
