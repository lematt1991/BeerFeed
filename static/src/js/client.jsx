import React from "react";
import ReactDOM from "react-dom";
import {Router, Route, IndexRoute, hashHistory, IndexRedirect} from 'react-router';

require('react-select/dist/react-select.css');


import Layout from "beerfeed/components/Layout";
import BeerMap from "beerfeed/components/Map";
import Feed from "beerfeed/components/Feed";
import LinkAccount from 'beerfeed/components/LinkAccount';
import About from 'beerfeed/components/About';
import Stats from 'beerfeed/components/Stats';


const app = document.getElementById('app');

ReactDOM.render(
	<Router history={hashHistory}>
		<Route path="/" component={Layout}>
			<IndexRedirect to="/feed"/>
			<Route path="map(/:brewery)" component={BeerMap}/>
			<Route path="feed" component={Feed}/>
			<Route path="linkAccount" component={LinkAccount}/>
			<Route path="about" component={About}/>
			<Route path="stats" component={Stats}/>
		</Route>
	</Router>,
	app
);
