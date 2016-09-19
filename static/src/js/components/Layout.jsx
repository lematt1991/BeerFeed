import React from "react";
import Nav from "./Nav";
import Feed from "./Feed";
import Footer from "./Footer";

export default class Layout extends React.Component {
  render() {
    return (
      <div>
        <Nav {...this.props}/>
        {this.props.children}
        <Footer/>
      </div>
    );
  }
}
