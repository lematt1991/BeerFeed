import React from 'react'
import {
	View, 
	Text, 
	StyleSheet, 
	Image,
	FlatList
} from 'react-native'
import {connect} from 'react-redux'
import FeedRow from '../components/FeedRow'

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

	constructor(props){
		super(props);
		this.state = {
			numRows : 20
		}
	}

	renderItem = ({item}) => {
		return(
			<FeedRow {...item} />
		)
	}
	

	render(){
		var rows = this.props.data.feedData.slice(0, this.state.numRows)
		const feed = this.props.settings.feeds[this.props.settings.currentFeed] || {};
		return(
			<View style={styles.container}>
				<View style={styles.textContainer}>
					<Text style={styles.titleText}>
	          The Beer Feed {feed.city}
	        </Text>
        </View>
        <View style={styles.listContainer}>
	        <FlatList
	        	data={rows}
	        	renderItem={this.renderItem}
	        	removeClippedSubviews={false}
	        />
        </View>
      </View>
		)
	}
}

const mapStateToProps = state => state
const mapDispatchToProps = dispatch => ({})

export default connect(mapStateToProps, mapDispatchToProps)(ListView);

const styles = StyleSheet.create({
	listContainer : {
		flex : 9,
		marginBottom : 20
	},
	textContainer : {
		flex : 1,
		marginTop : 50
	},
	titleText : {
		fontSize : 20,
		fontWeight : 'bold',
		textDecorationLine : 'underline',
	},
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
