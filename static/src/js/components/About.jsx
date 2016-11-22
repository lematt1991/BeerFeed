import React, {Component} from 'react';
import {Row, Jumbotron, Col, Button} from 'react-bootstrap';
import QA from 'beerfeed/components/QA';
import LinkAccount from 'beerfeed/components/LinkAccount';

const childID = {
	QA_ID : 0,
	LINK_ACCOUNT_ID : 1,
}

export default class About extends Component{

	constructor(){
		super()
		this.state = {
			buttonMsg : 'Help Improve Beer Feed',
			child : <QA/>,
			id : childID.QA_ID
		}
	}

	_handleClick(event){
		event.target.blur()
		if(this.state.id === childID.QA_ID){
			this.setState({
				buttonMsg : 'FAQ',
				child : <LinkAccount/>,
				id : childID.LINK_ACCOUNT_ID,
			})
		}else if(this.state.id === childID.LINK_ACCOUNT_ID){
			this.setState({
				buttonMsg : 'Help Improve Beer Feed',
				child : <QA/>,
				id : childID.QA_ID,
			})
		}else{
			console.log('ERROR!!!')
		}
	}

	render(){
		return(
			<div class="container">
				<Row>
				<Jumbotron>
				    <h1>Find better beer.</h1>
				    <p>
				    	Get a realtime feed of <i>only</i> the good beers that get 
				    	checked in to Untappd
				    </p>
				    <Button class="btn btn-primary" onClick={this._handleClick.bind(this)}>
				    	{this.state.buttonMsg}
				    </Button>	
				</Jumbotron>
				</Row>
				{this.state.child}
				<br/><br/>
			</div>
		)
	}
}