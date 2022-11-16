import React, { Component } from "react";
import gurps from "../img/gurps-logo.png";
import dnd from "../img/dnd-logo.png";
import coc from "../img/coc-logo.png";
import { Link } from "react-router-dom";

class Header extends Component {
  state = {};
  render() {
    return (
      <header className="App-header">
        <Link to={"/gurps"} className="btn App-btn">
          <img className="App-logo" src={gurps} alt="Gurps" />
        </Link>
        <Link to={"/dnd"} className="btn App-btn">
          <img className="App-logo" src={dnd} alt="D&D" />
        </Link>
        <Link to={"/coc"} className="btn App-btn">
          <img className="App-logo" src={coc} alt="CoC" />
        </Link>
      </header>
    );
  }
}

export default Header;
