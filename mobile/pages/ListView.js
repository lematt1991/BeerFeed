import React from 'react'
import {
	View, 
	Text, 
	StyleSheet, 
	Image,
	FlatList,
	ScrollView
} from 'react-native'
import {connect} from 'react-redux'
import FeedRow from '../components/FeedRow'
import { List, ListItem, SearchBar } from "react-native-elements";
import * as DataActions from '../actions/DataActions'

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
			numRows : 20,
			refreshing : false,
		}
	}

	orderByDate = (x, y) => {
		return x.checkin_id > y.checkin_id ? -1 : 1
	}

	orderByRating = (x, y) => {
		return x.rating > y.rating ? -1 : 1
	}

	orderByDistance = (x, y) => {
		var d1 = Math.pow(x.lat - this.state.location.lat, 2) + Math.pow(x.lon - this.state.location.lng, 2)
		var d2 = Math.pow(y.lat - this.state.location.lat, 2) + Math.pow(y.lon - this.state.location.lng, 2)
		return d1 < d2 ? -1 : 1
	}

	renderItem = ({item}) => {
		return(
			<FeedRow {...item} />
		)
	}
	
	renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "#CED0CE"
        }}
      />
    );
  };

  fetchData = () => {
    const lastID = this.props.data.lastID;
    const feed = this.props.settings.currentFeed;
    this.setState({...this.state, refreshing : true})
    console.log('Refreshing')
    this.props.updateData(feed, lastID)
    	.then(() => {
    		this.setState({...this.state, refreshing : false})
    		console.log('Done refreshing')
    	})  
  }

	render(){
		const threshold = this.props.settings.checkin_count_threshold;
		var rows = this.props.data.feedData.filter(r => r.checkin_count >= threshold);

		if(this.props.settings.ordering === 'date'){
			rows.sort(this.orderByDate);
		}else if (this.props.settings.ordering === 'rating'){
			rows.sort(this.orderByRating);
		}

		rows = rows.slice(0, this.state.numRows)

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
		        	onRefresh={this.fetchData}
		        	refreshing={this.state.refreshing}
		        	style={styles.flatList}
		        	onEndReachedThreshold={5}
		        	onEndReached={() => this.setState({...this.state, numRows : this.state.numRows + 20})}
		        	data={rows}
		        	renderItem={this.renderItem}
		        	removeClippedSubviews={false}
		        	ItemSeparatorComponent={this.renderSeparator}
		        />
	        </View>
	      </View>
		)
	}
}

const mapStateToProps = state => state
const mapDispatchToProps = dispatch => ({
	updateData : (feed, lastID) => dispatch(DataActions.updateData(feed, lastID))
})

export default connect(mapStateToProps, mapDispatchToProps)(ListView);

const styles = StyleSheet.create({
	flatList : {
		flex: 1
	},
	listContainer : {
		flex : 9
	},
	textContainer : {
		flex : 1,
		marginTop : 30,
		alignItems : 'center'
	},
	titleText : {
		fontSize : 20,
		fontWeight : 'bold',
	},
  container: {
    flex: 1,
    zIndex : 2,
    marginLeft : 20,
    marginRight : 20,
    backgroundColor: '#fff',
  },
  icon : {
  	height : 26,
  	width : 26
  }
});
