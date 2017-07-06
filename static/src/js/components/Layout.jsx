import React from "react";
import Nav from "../components/Nav";
import Feed from "../components/Feed";
import Footer from "../components/Footer";
import Spinner from 'react-spinkit'
import {connect} from 'react-redux'


class Layout extends React.Component {
  render() {
    return (
      <div>
        <Nav {...this.props}/>
        {this.props.children}
        {
          this.props.spinner.loading ? 
            <div style={{position : 'absolute', top : 0, bottom : 0, left : 0, right : 0}}>
              <div style={styles.background}>
              </div>
              <div style={{zIndex : 40, height : '100%', width : '100%', display : 'flex', alignItems : 'center', justifyContent : 'center'}}>
                <Spinner name='three-bounce' noFadeIn />
              </div>
            </div> : null
        }
      </div>
    );
  }
}

const mapStateToProps = state => state
const mapDispatchToProps = dispatch => ({dispatch})
export default connect(mapStateToProps, mapDispatchToProps)(Layout);

const styles = {
  container: {
    backgroundColor: 'rgb(209,214,220)',
    width: '100%',
    height: '100%',
    position: 'absolute',
    overflow : 'scroll'
  },
  background : {
    position : 'absolute',
    top : 0,
    bottom : 0,
    right : 0, left : 0,
    backgroundColor : 'rgb(93,97,100)',
    opacity : 0.7,
    zIndex : 10
  }
}