import React from 'react'
import {
	View, 
	Text, 
	StyleSheet, 
	Image,
	TextInput,
	ListView as RListView,	
	FlatList,
	ScrollView
} from 'react-native'
import {connect} from 'react-redux'
import FeedRow from '../components/FeedRow'
import { List, ListItem, SearchBar, Button } from "react-native-elements";
import * as DataActions from '../actions/DataActions'
import * as SettingsActions from '../actions/SettingsActions';
import SearchInput, {createFilter} from 'react-search-input'

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
			refreshing : false
		}
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
		console.log(`Rendering ${this.props.data.visibleRows.length} items`)
		const ds = new RListView.DataSource({rowHasChanged : (r1, r2) => r1 !== r2});
		const feed = this.props.settings.feeds[this.props.settings.currentFeed] || {};


		return(
				<View style={styles.container}>
					<View style={styles.textContainer}>
						<Text style={styles.titleText}>
		          The Beer Feed {feed.city}
		        </Text>
	        </View>
	        <View style={{marginBottom : 10, backgroundColor : '#e1e8ee'}}>
		        <TextInput
		        	onChangeText={this.props.setSearchTerm}
		        	style={styles.input}
		        	clearButtonMode='always'
		        	placeholder='Beers, breweries, or venues'
		        />
	        </View>
	        <View style={styles.listContainer}>
		        <RListView
		        	initialListSize={20}
			       	style={styles.flatList}
		        	dataSource={ds.cloneWithRows(this.props.data.visibleRows)}
		        	renderRow={this.renderItem}
		        	ItemSeparatorComponent={this.renderSeparator}
		        />
	        </View>
	      </View>
		)
	}
}

const mapStateToProps = state => state
const mapDispatchToProps = dispatch => ({
	updateData : (feed, lastID) => dispatch(DataActions.updateData(feed, lastID)),
	setSearchTerm : term => dispatch(SettingsActions.setSearchTerm(term))
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
