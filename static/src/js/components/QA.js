import React, {Component} from 'react';
import {Col, Row, Jumbotron, Button} from 'react-bootstrap';

export default class QA extends Component{

	render(){
		return(
			<div>
				<Row>	
					<h1>How does it work?</h1>
				</Row>
				<Row>
					<Col md={8}>
						<h4>
							Beer Feed processes the Untappd feed in your area and filters out
							checkins that have an aggregate score lower than some threshold.
						</h4>
					</Col>
				</Row>

				<Row>	
					<h1>What threshold is used?</h1>
				</Row>
				<Row>
					<Col md={8}>
						<h4>
							Currently, a 4.0 scoring threshold is imposed.  This is subject
							to change and may be a user defined parameter in the future.
						</h4>
					</Col>
				</Row>

				<Row>	
					<h1>What is my location being used for?</h1>
				</Row>
				<Row>
					<Col md={8}>
						<h4>
							Upon startup, Beer Feed will ask if it is OK to use your current
							location.  This is used only to locate your coordinates on the 
							map to make it easier to find checkins near you.
						</h4>
					</Col>
				</Row>

				<Row>	
					<h1>When will Beer Feed be avaiable in my area?</h1>
				</Row>

				<Row>
					<Col md={8}>
						<h4>
							Curently, there are some limitations regarding the amount of data
							that can be requested from Untappd.  As the user base of Beer Feed
							grows, the coverage will grow with it.  Click the "Help Improve Beer Feed"
							button above to find out more. 
						</h4>
					</Col>
				</Row>
				<br/><br/>
			</div>
		)
	}
}

