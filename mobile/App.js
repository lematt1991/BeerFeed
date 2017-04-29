import React from 'react';
import { StyleSheet, Text, View, StatusBar, AsyncStorage } from 'react-native';
import ListView from './pages/ListView'
import MapView from './pages/MapView'
import { connect, Provider as ReduxProvider } from 'react-redux';
import store from './Store'
import { persistStore } from 'redux-persist'
import AppNavigator from './navigation/AppNavigator'

export default class AppContainer extends React.Component {
  render() {
    return (
      <ReduxProvider store={store}>
        <App/>
      </ReduxProvider>
    );
  }
}

class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      rehydrating : true
    }
  }

  componentWillMount(){
    persistStore(store, {storage: AsyncStorage}, () => {
      this.setState({rehydrating : false})
    })
  }

  render(){
    if(this.state.rehydrating){
      return(<Text>Rehydrating...</Text>)
    }
    return(
      <AppNavigator ref={nav => {this.navigator = nav;}} />
    )
  }
}