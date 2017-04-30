import React from 'react';
import { StyleSheet, Text, View, StatusBar, AsyncStorage } from 'react-native';
import ListView from './pages/ListView'
import MapView from './pages/MapView'
import { connect, Provider as ReduxProvider } from 'react-redux';
import store from './Store'
import { persistStore } from 'redux-persist'
import AppNavigator from './navigation/AppNavigator'
import * as DataActions from './actions/DataActions'
import * as SettingsActions from './actions/SettingsActions'
import './Init'
import InitializingPage from './pages/InitializingPage'

export default class AppContainer extends React.Component {
  render() {
    return (
      <ReduxProvider store={store}>
        <App/>
      </ReduxProvider>
    );
  }
}

class AppRaw extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      rehydrating : true
    }
  }

  fetchData = () => {
    const lastID = store.getState().data.lastID;
    const feed = store.getState().settings.currentFeed;
    if(store.getState().data.feedData.length === 0){
      this.props.fetchData(feed)
    }else{
      this.props.updateData(feed, lastID);
    }
  }

  componentWillMount(){
    persistStore(store, {storage: AsyncStorage}, () => {
      console.log('Done rehydrating')
      this.setState({rehydrating : false})
      this.fetchData()
      this.props.fetchFeeds()
    })
  }

  render(){
    return(
      this.state.rehydrating ? 
        <InitializingPage/> :
        <AppNavigator ref={nav => {this.navigator = nav;}} />
    )
  }
}

const mapStateToProps = state => ({})
const mapDispatchToProps = dispatch => ({
  updateData : (feed, lastID) => dispatch(DataActions.updateData(feed, lastID)),
  fetchData : feed => dispatch(DataActions.fetchData(feed)),
  fetchFeeds : () => dispatch(SettingsActions.fetchFeeds)
})

const App = connect(mapStateToProps, mapDispatchToProps)(AppRaw);






