import 'react-select/dist/react-select.css';
import React from "react";
import ReactDOM from "react-dom";
import Store from './Store';
import './Init'
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom'
import Layout from "./components/Layout";
import BeerMap from "./components/Map";
import Feed from "./components/Feed";
import LinkAccount from './components/LinkAccount';
import About from './components/About';
// import Stats from './components/Stats';
import {Provider} from 'react-redux';

const app = document.getElementById('app');

ReactDOM.render(
	<Provider store={Store}>
		<Router>
			<Switch>
				<Layout>
					<Route path='/' exact component={Feed}/>
					<Route path='/map' component={BeerMap}/>
					<Route path='/about' component={About}/>
				</Layout>
			</Switch>
		</Router>
	</Provider>,
	app
)