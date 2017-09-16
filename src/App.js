import './App.css'
import 'react-select/dist/react-select.css';
import React from "react";
import Store, {history} from './Store';
import './Init'
import { Route, Switch } from 'react-router-dom'
import Layout from "./components/Layout";
import BeerMap from "./components/Map";
import Feed from "./components/Feed";
import About from './components/About';
import {Provider} from 'react-redux';
import { ConnectedRouter } from 'react-router-redux'

export default class App extends React.Component{
  render(){
    return(
      <Provider store={Store}>
        <ConnectedRouter history={history}>
          <Switch>
            <Layout>
              <Route path='/' exact component={Feed}/>
              <Route path='/map/:venue_id?' exact component={BeerMap}/>
              <Route path='/about' component={About}/>
            </Layout>
          </Switch>
        </ConnectedRouter>
      </Provider>
    )
  }
}