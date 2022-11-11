import React, { Component } from "react";
import Dice from "../scripts/Dice.ts";
import Utils from "../scripts/Utils.ts";

class Counter extends Component {
  state = {
    count: 0,
  };
  render() {
    return (
      <React.Fragment>
        <h1>Hello World</h1>
      </React.Fragment>
    );
  }
}

export default Counter;
