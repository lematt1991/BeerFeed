import React, {Component} from 'react';
import {Link} from 'react-router';
import {Row} from 'react-bootstrap';

export default class Footer extends Component{
	constructor(){
		super();
	}

	render(){
		return(
			<footer class="footer">
		      <div class="container">
		      	<Row md={8}>
			        <p class="text-muted">Powered by Untappd</p>
			    </Row>
		      </div>
		    </footer>
		);
	}

}

const styles={
	link : {
	}
}
