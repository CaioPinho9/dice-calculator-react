import React, { Component } from "react";
import Counter from "../components/Counter";
import "./DiceCalculator.css";
import Form from "./Form";

class DiceCalculator extends Component {
  state = {
    rpgSistem: this.props.rpgSistem,
    damage: false,
  };
  render() {
    return (
      <div className="Calculator-main">
        <form className="Calculator-form" action="">
          <div className="break"></div>
          <Form rpgSistem={this.state.rpgSistem} />
          <input
            style={{ height: "min-content", width: "100px", marginTop: "15px" }}
            type="submit"
            value="Submit"
          />
        </form>
        <Counter />
      </div>
    );
  }
}

export default DiceCalculator;
