import React from "react";

import Nav from "./Nav";
import Feed from "./Feed";
import Footer from "./Footer";

export default class Layout extends React.Component {
  constructor() {
    super();
    this.state = {
      title: "Welcome",
    };
  }

  changeTitle(title) {
    this.setState({title});
  }

  render() {
    return (
      <div>
        <Nav/>
        <Feed/>
        <Footer/>
      </div>
    );
  }
}
