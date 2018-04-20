import React from 'react';
import {
	Text,
	StyleSheet,
	View,
	Image
} from 'react-native';

const styles = StyleSheet.create({
	container : {
		flex : 1,
		flexDirection : 'row',
		alignItems : 'center',
		justifyContent: 'flex-start',
		marginBottom : 10,
	},
	imageContainer : {
		marginRight : 10
	},
	image : {
		width : 50,
		height : 50
	}
})

export default class NoRows extends React.PureComponent{
	render(){
		return(
			<View style={styles.container}>
				<Text>
					No Rows!
				</Text>
			</View>
		)
	}
}

