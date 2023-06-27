import React, { Component } from "react";
import "./Pages.css";
import DiceCalculator from "../components/DiceCalculator";

class Vampire extends Component {
  state = {};
  render() {
    return (
      <main className="container Pages">
        <DiceCalculator rpgSystem="vampire" />
      </main>
    );
  }
}

export default Vampire;
