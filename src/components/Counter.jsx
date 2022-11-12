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
    var dice1 = new Dice(2, 6);
    var dice2 = new Dice(1, 4);
    var dice3 = Utils.ChanceToPercent(Dice.ChancesRerollOne(2, 6, 2));
    var string = "";
    for (let index = dice3.min(); index < dice3.size() + dice3.min(); index++) {
      string += index + ":" + dice3.get(index) + " ";
    }

    return string;
  }
}

export default Counter;
