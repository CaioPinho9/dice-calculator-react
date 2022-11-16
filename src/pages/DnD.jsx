import React, { Component } from "react";
import "./Pages.css";
import DiceCalculator from "../components/DiceCalculator";

class DnD extends Component {
  state = {};
  render() {
    return (
      <main className="container Pages">
        <h1>D&D</h1>
        <DiceCalculator />
      </main>
    );
  }
}

export default DnD;
