import React, {Component} from 'react';
import {Row} from 'react-bootstrap';

export default class Footer extends Component{
	render(){
		return(
			<footer class="site-footer">
		      <div class="container">
		      	<Row md={8}>
			        <p class="text-muted">Powered by Untappd</p>
			    </Row>
		      </div>
		    </footer>
		);
	}
}