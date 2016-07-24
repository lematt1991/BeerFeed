import React from "react";

export default class Nav extends React.Component {

  constructor(){
    super();
    var defaultLoc = <li class="active" onClick={this._changeLoc}> <a href="#"> Rochester, NY</a></li>;
    this.state = {
      currentLocation : defaultLoc,
      locations : [
        defaultLoc,
        <li onClick={this._changeLoc}> <a href="#"> New York, NY (Coming soon...)</a></li>
      ]
    };
  }

  _changeLoc(event){
    console.log(event)
  }

  render() {
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
                  {
                    this.state.locations   
                  }
                </ul>
              </li>

            </ul>
          </div>
        </div>
      </nav>
    );
  }
}
