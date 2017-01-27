import React from "react";
import Nav from "../components/Nav";
import Feed from "../components/Feed";
import Footer from "../components/Footer";

export default class Layout extends React.Component {
  render() {
    return (
      <div>
        <Nav {...this.props}/>
        {this.props.children}
      </div>
    );
  }
}
