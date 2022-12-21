import React, { Component } from "react";
import "./Pages.css";
import DiceCalculator from "../components/DiceCalculator";

class DnD extends Component {
  state = {};
  render() {
    return (
      <main className="container Pages">
        <DiceCalculator rpgSystem="dnd" />
      </main>
    );
  }
}

export default DnD;
