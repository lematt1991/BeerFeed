import React from "react";
import {Link} from 'react-router';
import settingsStore from '../stores/SettingsStore';
import * as SettingsActions from '../actions/SettingsActions';

export default class Nav extends React.Component {

  constructor(){
    super();
    this.state = {feeds : settingsStore.getFeeds(), currentFeed : settingsStore.getCurrentFeed()};
  }

  _changeLoc(event){
    SettingsActions.changeFeed(event.target.id);
  }

  updateFeed(){
    this.setState({feeds : this.state.feeds, currentFeed : settingsStore.getCurrentFeed()})
  }

  componentWillMount(){
    settingsStore.on('change', this.updateFeed.bind(this));
  }



  render() {
    var locations = [];
    for(var feed in this.state.feeds){
      if(feed === this.state.currentFeed){
        locations.push(
          <li key={feed} class="active" onClick={this._changeLoc.bind(this)}>
            <a href="#" id={feed}>{this.state.feeds[feed].name}</a>
          </li>
        )
      }else{
        locations.push(
          <li key={feed} onClick={this._changeLoc.bind(this)}>
            <a href="#" id={feed}>{this.state.feeds[feed].name}</a>
          </li>
        )
      }
    }
    return (
      <nav class="navbar navbar-default">
        <div class="container-fluid">
          <div class="collapse navbar-collapse">
            <ul class="nav navbar-nav">
              <li class="dropdown">
                <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                  Choose Location <span class="caret"></span>
                </a>
                <ul class="dropdown-menu">
                  {locations}
                </ul>
              </li>
              <li><Link to="/">List View</Link></li>
              <li><Link to="map">Map View</Link></li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}
