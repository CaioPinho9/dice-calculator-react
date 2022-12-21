import React, { Component } from "react";
import "./Pages.css";
import DiceCalculator from "../components/DiceCalculator";

class CoC extends Component {
  state = {};
  render() {
    return (
      <main className="container Pages">
        <DiceCalculator rpgSystem="coc" />
      </main>
    );
  }
}

export default CoC;
