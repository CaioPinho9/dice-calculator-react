import React, { Component } from "react";
import gurps from "../img/gurps-logo.png";
import dnd from "../img/dnd-logo.png";
import coc from "../img/coc-logo.png";
import logo from "../img/logo.png";
import { Link } from "react-router-dom";

class Header extends Component {
  handleClick = (e) => {
    for (
      let index = 0;
      index < document.getElementsByClassName("App-btn").length;
      index++
    ) {
      const button = document.getElementsByClassName("App-btn").item(index);
      button.className = "btn App-btn";
    }
    if (e.target.className === "btn App-btn") {
      e.target.className = "btn App-btn Btn-active";
    }
  };

  render() {
    return (
      <header className="App-header">
        <Link onClick={this.handleClick} to={"/"} className="btn Btn-Home">
          <img className="App-logo" src={logo} alt="Home" />
        </Link>
        <Link onClick={this.handleClick} to={"/gurps"} className="btn App-btn">
          <img className="App-logo" src={gurps} alt="Gurps" />
        </Link>
        <Link onClick={this.handleClick} to={"/dnd"} className="btn App-btn">
          <img className="App-logo" src={dnd} alt="D&D" />
        </Link>
        <Link onClick={this.handleClick} to={"/coc"} className="btn App-btn">
          <img className="App-logo" src={coc} alt="CoC" />
        </Link>
      </header>
    );
  }
}

export default Header;
