import React, {Component} from 'react';
import {Col, Row, Jumbotron, Button} from 'react-bootstrap';
import {Link} from 'react-router';

export default class LinkAccount extends Component{

	_handleClick(event){
		console.log('clicked')
	}

	render(){
		return(
			<div>
				<Row>
					<div class="text-center">
					<h1><u>Link your Untappd account with Beer Feed</u></h1>
					</div>
				</Row>

				<br/><br/>

				<Row className="show-grid">
					<h1>How does this help?</h1>
				</Row>
				<Row>
					<Col md={8}>
					<h4>
						The Untappd API limits the number of requests that can be 
						made to their server on an hourly basis.  The limit is 
						applied on a per user basis, so the more users that link 
						their accounts, the more requests can be made to the server.
						This will reduce the likelihood of the site going down
						and allow for us to 
						expand the feed to additional areas in the future.
					</h4>
					</Col>
				</Row>
				<Row className="show-grid">
					<h1>How will my account be used?</h1>
				</Row>
				<Row>
					<Col md={8}>
					<h4>
						Your account will not be used by Beer Feed in any way.  The
						purpose of linking is solely to allow for more API requests
						to the Untappd server.
					</h4>
					</Col>
				</Row>

				<br/>

				<Row>
					<div class="col-md-12 text-center">
						<a id='link-account' class="btn btn-primary" href={'/Auth'} onClick={this._handleClick.bind(this)}>
							Click Here To Link Account
						</a>
					</div>
				</Row>

				<br/><br/>
			</div>
		)
	}
}