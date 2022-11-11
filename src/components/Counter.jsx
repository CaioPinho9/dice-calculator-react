import React, { Component } from "react";
import Dice from "../scripts/Dice.ts";
import Dictionary from "../scripts/Dictionary.ts";
import Utils from "../scripts/Utils.ts";

class Counter extends Component {
  state = {
    count: 0,
  };
  render() {
    return (
      <React.Fragment>
        <h1>Hello World</h1>
        <p>{this.test()}</p>
      </React.Fragment>
    );
  }

  test() {
    var dice1 = new Dice(2, 6);
    var dice2 = new Dice(1, 4);
    var dice3 = Utils.ChanceToPercent(
      Dice.MergeDiceProbability(
        dice1.getProbability(),
        dice2.getProbability(),
        false
      )
    );

    return (
      dice3.get(3) +
      " " +
      dice3.get(4) +
      " " +
      dice3.get(5) +
      " " +
      dice3.get(6)
    );
  }
}

export default Counter;
