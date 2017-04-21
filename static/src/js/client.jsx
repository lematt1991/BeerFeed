import React from "react";
import ReactDOM from "react-dom";
import {Router, Route, IndexRoute, browserHistory, IndexRedirect} from 'react-router';
import Store from './Store';
import './Init'
require('react-select/dist/react-select.css');

import Layout from "./components/Layout";
import BeerMap from "./components/Map";
import Feed from "./components/Feed";
import LinkAccount from './components/LinkAccount';
import About from './components/About';
import Stats from './components/Stats';
import {Provider} from 'react-redux';

const app = document.getElementById('app');

ReactDOM.render(
	<Provider store={Store}>
		<Router history={browserHistory}>
			<Route path="/" component={Layout}>
				<IndexRedirect to="/the_feed"/>
				<Route path="map(/:brewery)" component={BeerMap}/>
				<Route path="the_feed" component={Feed}/>
				<Route path="linkAccount" component={LinkAccount}/>
				<Route path="about" component={About}/>
				<Route path="stats" component={Stats}/>
			</Route>
		</Router>
	</Provider>,
	app
);
