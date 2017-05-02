import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import store from './Store'
import AppNavigator from './navigation/AppNavigator'
import './Init'

export default class AppContainer extends React.Component {
  render() {
    return (
      <ReduxProvider store={store}>
        <AppNavigator ref={nav => {this.navigator = nav;}}/>
      </ReduxProvider>
    );
  }
}