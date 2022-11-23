import React, { Component } from "react";
import "./Pages.css";
import DiceCalculator from "../components/DiceCalculator";

class Gurps extends Component {
  state = {};
  render() {
    return (
      <main className="container Pages">
        <h1>GURPS</h1>
        <DiceCalculator rpgSystem="gurps" />
      </main>
    );
  }
}

export default Gurps;
