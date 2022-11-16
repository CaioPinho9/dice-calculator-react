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
        <p>{this.test()}</p>
      </React.Fragment>
    );
  }

  test() {
    var dice = Dice.AdvantageChances(2, 6, false, 1, false);

    var dice3 = Utils.ChanceToPercent(dice);
    var string = "";
    for (let index = dice3.min(); index < dice3.size() + dice3.min(); index++) {
      string += index + ":" + dice3.get(index) + " ";
    }

    return string;
  }
}

export default Counter;
