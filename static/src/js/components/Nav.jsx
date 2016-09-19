import React from "react";
import settingsStore from '../stores/SettingsStore';
import searchStore from '../stores/SearchStore';
import * as SearchActions from '../actions/SearchActions';
import * as SettingsActions from '../actions/SettingsActions';
import * as BS from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

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

  updateSearch = (e) => {
    SearchActions.changeSearchTerm(e.target.value)
  }

  render() {    
    console.log(searchStore.getSearchTerm())
    return (
      <BS.Navbar style={{zIndex : 3}}>
        <BS.Navbar.Header>
          <BS.Navbar.Toggle/>
        </BS.Navbar.Header>
        <BS.Navbar.Collapse>
          <BS.Nav>
            <BS.NavDropdown eventKey={1} title="Choose Location" id="loc-dropdown">
              {
                Object.keys(this.state.feeds).map((feed) => 
                  <BS.MenuItem 
                                id={feed} 
                                key={feed} 
                                onClick={this._changeLoc.bind(this)} 
                                active={feed == this.state.currentFeed}
                  >
                    {this.state.feeds[feed].name}
                  </BS.MenuItem>
                )
              }
            </BS.NavDropdown>
            <LinkContainer to="/feed">
              <BS.NavItem eventKey={2}>
                List View
              </BS.NavItem>
            </LinkContainer>
            <LinkContainer to="map">
              <BS.NavItem eventKey={2}>
                Map View
              </BS.NavItem>
            </LinkContainer>
            <LinkContainer to="about">
              <BS.NavItem eventKey={3}>
                About
              </BS.NavItem>
            </LinkContainer>
          </BS.Nav>
          {
            this.props.location.pathname === '/feed' ? 
              <BS.Navbar.Form>
                <BS.FormControl
                  type="text"
                  placeholder="Filter"
                  onChange={this.updateSearch}
                />
              </BS.Navbar.Form> : null
          }
        </BS.Navbar.Collapse>
      </BS.Navbar>
    );
  }
}
