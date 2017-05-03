import React from 'react'
import {
	View, 
	Text, 
	StyleSheet, 
	Image,
	TextInput,
	FlatList,
	ListView as RListView,
	ScrollView,
	RefreshControl
} from 'react-native'
import {connect} from 'react-redux'
import FeedRow from '../components/FeedRow'
import { List, ListItem, SearchBar } from "react-native-elements";
import * as DataActions from '../actions/DataActions'
import SearchInput, {createFilter} from 'react-search-input'

const KEYS_TO_FILTER = ['brewery', 'name', 'venue']

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
			searchTerm : '',
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

	renderItem = (item) => {
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
		var filter = createFilter(this.state.searchTerm, KEYS_TO_FILTER)
		var rows = this.props.data.feedData.filter(r => r.checkin_count >= threshold && filter(r))

		if(this.props.settings.ordering === 'date'){
			rows.sort(this.orderByDate);
		}else if (this.props.settings.ordering === 'rating'){
			rows.sort(this.orderByRating);
		}

		rows = rows.slice(0, this.state.numRows)

		const feed = this.props.settings.feeds[this.props.settings.currentFeed] || {};

		const ds = new RListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
		console.log('Rendering list')
		return(
				<View style={styles.container}>
					<View style={styles.textContainer}>
						<Text style={styles.titleText}>
		          The Beer Feed {feed.city}
		        </Text>
	        </View>
	        <View style={{marginBottom : 10, backgroundColor : '#e1e8ee'}}>
		        <TextInput
		        	onChangeText={term => this.setState({searchTerm : term})}
		        	style={styles.input}
		        	clearButtonMode='always'
		        	placeholder='Beers, breweries, or venues'
		        />
	        </View>
	        <View style={styles.listContainer}>
		        <RListView
		        	onRefresh={this.fetchData}
		        	refreshing={this.state.refreshing}
		        	style={styles.flatList}
		        	onEndReached={() => this.setState({numRows : this.state.numRows + 10})}
		        	dataSource={ds.cloneWithRows(rows)}
		        	renderRow={this.renderItem}
		        	removeClippedSubviews={false}
		        	renderSeparator={this.renderSeparator}
		        	refreshControl={
			          <RefreshControl
			            refreshing={this.state.refreshing}
			            onRefresh={this.fetchData}
			          />
			        }
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
	input : {
		height : 30, 
		backgroundColor : 'white', 
		marginLeft : 10, 
		marginRight : 10, 
		marginBottom : 5, 
		marginTop : 5, 
		borderRadius : 3, 
		paddingLeft : 5
	},
	flatList : {
		flex: 1
	},
	listContainer : {
		flex : 9,
		marginLeft : 20,
		marginRight : 20
	},
	textContainer : {
		flex : 1,
		backgroundColor : '#e1e8ee',
		alignItems : 'center',
	},
	titleText : {
		marginBottom : 10,
		marginTop : 30,
		fontSize : 20,
		fontWeight : 'bold',
	},
  container: {
    flex: 1,
    zIndex : 2,
    backgroundColor: '#fff',
  },
  icon : {
  	height : 26,
  	width : 26
  }
});
