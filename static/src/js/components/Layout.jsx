import React from "react";
import Nav from "beerfeed/components/Nav";
import Feed from "beerfeed/components/Feed";
import Footer from "beerfeed/components/Footer";

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
