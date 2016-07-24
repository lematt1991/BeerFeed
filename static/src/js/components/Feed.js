import React, {Component} from 'react';
const util = require('util');


export default class Feed extends Component{
	_fetchData(){
		$.get('http://beerfeed-ml9951.rhcloud.com/Feed?user=rochester_feed').then(
			function(data){
				this.setState({rows : data.checkins, lastID : data.lastID})
			}.bind(this)
		)
	}

	constructor(){
		super()
		this.state = {rows : [], lastID : 0};
		this._fetchData();
		setInterval(this._fetchData.bind(this), 5000)
	}

	_renderRow(row){
		var date = new Date(row.created)
		var url = util.format('https://www.google.com/maps/preview?z=14&q=loc:%d+%d',row.lat,row.lon);
		return(
			<tr data-status="pagado" key={row.checkin_id}>
				<td>
					<div class="media">
						<img style={{'margin-top' : '12px'}} src={row.pic} width="100" height="100" class="pull-left media-photo beer-image"/>
						<div class="media-body">
							<span class="media-meta pull-right">{date.toDateString()}</span>
							<h4 class="title">
								Brewery: {row.brewery}
							</h4>
							<h4>
								Beer: {row.name}
							</h4>
							<h4>
								Score: {row.rating}
							</h4>
							<h4>	
								Found at: <a href={url}>{row.venue}</a>
							</h4>
						</div>
					</div>
				</td>
			</tr>
		);
	}

	_showPosition(pos){
		console.log(pos)
	}

	render(){
		return(
			<div class="container-fluid">
				<div class="row">
					<section class="content">
						<div class="col-md-8 col-md-offset-2">
							<h1 class="text-center">Beer Feed</h1>
							<div class="panel panel-default">
								<div class="panel-body">
									<div class="table-container">
										<table class="table table-filter">
											<tbody>
												{
													this.state.rows.map(this._renderRow)
												}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
					</section>
				</div>
			</div>
		);
	}
} 