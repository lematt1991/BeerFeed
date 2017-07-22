import 'react-select/dist/react-select.css';
import React from "react";
import ReactDOM from "react-dom";
import Store, {history} from './Store';
import './Init'
import { Route, Switch } from 'react-router-dom'
import Layout from "./components/Layout";
import BeerMap from "./components/Map";
import Feed from "./components/Feed";
import LinkAccount from './components/LinkAccount';
import About from './components/About';
import {Provider} from 'react-redux';
import { ConnectedRouter, push } from 'react-router-redux'

const app = document.getElementById('app');

ReactDOM.render(
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
	</Provider>,
	app
)