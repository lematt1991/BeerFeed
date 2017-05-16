import React from 'react'
import {
	View, 
	Text, 
	StyleSheet, 
	Image,
	FlatList,
	ScrollView,
	AsyncStorage
} from 'react-native'
import store from '../Store'
import { persistStore } from 'redux-persist'
import {connect} from 'react-redux'
import * as DataActions from '../actions/DataActions'
import * as SettingsActions from '../actions/SettingsActions'
import { NavigationActions } from 'react-navigation'
import {getLocation} from '../Init'

function getDistance(c1, c2){
  return (c1.lat - c2.lat) * (c1.lat - c2.lat) + 
         (c1.lon - c2.lon) * (c1.lon - c2.lon);
}

class InitializingPage extends React.Component{
	fetchData = () => {
    const lastID = store.getState().data.lastID;
    const feed = store.getState().settings.currentFeed;
    if(store.getState().data.feedData.length === 0){
      return this.props.fetchData(feed)
    }else{
      return this.props.updateData(feed, lastID);
    }
  }

	componentWillMount(){
    persistStore(store, {storage: AsyncStorage}, () => {
      console.log('Done rehydrating')
      Promise.all([getLocation(), this.fetchData(), this.props.fetchFeeds()])
      	.then(() => {
      		const {username} = store.getState().user;
      		const routeName = 'MainNavigator';

          const {feeds, currentFeed} = store.getState().settings;
          const {latitude, longitude} = store.getState().location;
          const myPosition = {lat : latitude, lon : longitude};

          var nearestDistance = Number.MAX_SAFE_INTEGER;
          var nearestFeed;
          for(const key in feeds){
            var feed = feeds[key]
            const distance = getDistance(feed, myPosition);
            if(distance < nearestDistance){
              nearestDistance = distance;
              nearestFeed = feed
            }
          }

          const nextPage = () => {
            this.props.navigation.dispatch(NavigationActions.reset({
              index : 0,
              actions: [NavigationActions.navigate({routeName})]
            }))
          }

          if(nearestFeed && nearestFeed.distance !== currentFeed){
            store.dispatch(SettingsActions.changeFeed(nearestFeed.id));
            store.dispatch(DataActions.fetchData(nearestFeed.id)).then(nextPage)
          }else{
            nextPage()
          }
      	})
    })
  }

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

const mapStateToProps = state => ({})
const mapDispatchToProps = dispatch => ({
  updateData : (feed, lastID) => dispatch(DataActions.updateData(feed, lastID)),
  fetchData : feed => dispatch(DataActions.fetchData(feed)),
  fetchFeeds : () => dispatch(SettingsActions.fetchFeeds)
})

export default connect(mapStateToProps, mapDispatchToProps)(InitializingPage);

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
