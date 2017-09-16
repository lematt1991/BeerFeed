import React, {Component} from 'react';
import {Row, Jumbotron, Button} from 'react-bootstrap';
import QA from '../components/QA';
import LinkAccount from '../components/LinkAccount';

export default class About extends Component{
	constructor(){
		super()
		this.state = {
			buttonMsg : 'Help Improve Beer Feed',
			child : <QA/>,
			QA : true
		}
	}

	_handleClick(event){
		if(this.state.QA){
			this.setState({
				buttonMsg : 'FAQ',
				child : <LinkAccount/>,
				QA : false
			})
		}else{
			this.setState({
				buttonMsg : 'Help Improve Beer Feed',
				child : <QA/>,
				QA : true
			})
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