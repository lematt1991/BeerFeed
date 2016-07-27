import React from "react";
import ReactDOM from "react-dom";
import {Router, Route, IndexRoute, hashHistory} from 'react-router';

import Layout from "./components/Layout";
import BeerMap from "./components/Map";
import Feed from "./components/Feed";
const app = document.getElementById('app');

ReactDOM.render(
	<Router history={hashHistory}>
		<Route path="/" component={Layout}>
			<IndexRoute component={Feed}/>
			<Route path="map" component={BeerMap}/>
		</Route>
	</Router>,
	app
);
