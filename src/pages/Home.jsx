import React, { Component } from "react";
import "./Pages.css";
import { Link } from "react-router-dom";

class Home extends Component {
  state = {};
  render() {
    return (
      <main className="container Pages Home">
        <h1>Welcome to Dice Calculator</h1>
        <p>
          A project created to show the difference in probability between dice
          sets
        </p>

        <div className="Home-grid">
          <div className="Home-col">
            <h1>How does it works?</h1>
            <p>
              A dice has the same chance of obtaining each number as a result.
              However, combing dice sets changes this probability. This site
              calculates these changes and converts them into a readable chart.
            </p>
          </div>
          <div className="Home-col">
            <h1>General Commands</h1>
            <p>Click to try it out!</p>
            <ul>
              <li>
                <Link to={"/dnd/dices"} title="Ex: 2d8">
                  Dice&#40;d&#41;: Number of dices than how many sides, 2d8 = 2
                  dices of 8 sides.
                </Link>
              </li>
              <li>
                <Link to={"/dnd/addition"} title="Ex: 1d4+2d6+2">
                  Addition&#40;+&#41;: It's possible to add dices with different
                  sides together
                </Link>
              </li>
              <li>
                <Link to={"/dnd/multiplication"} title="Ex: 3d6*5, not 3d6*1d4">
                  Multiplication&#40;*&#41;: Only multiplicate a dice with a
                  number,
                </Link>
              </li>
              <li>
                <Link to={"/dnd/advantage"} title="Ex: 2&gt;d20, 3&gt;d100">
                  Advantage&#40;&gt;&#41;: Keeps the best result only
                </Link>
              </li>
              <li>
                <Link to={"/dnd/disadvantage"} title="Ex: 2&lt;d20, 3&lt;d100">
                  Disadvantage&#40;&lt;&#41;: Keeps the worst result only,
                </Link>
              </li>
              <li>
                <Link to={"/dnd/difficulty"} title="Ex: 1d20 DC:15">
                  Difficulty&#40;DC/NH&#41;: Sets which numbers are considered
                  success or failure depending on the rpg system.
                </Link>
              </li>
              <li>
                <Link to={"/dnd/damage"} title="Ex: 1d20 DC:15 Damage:3d6">
                  Damage: Failures give zero damage.
                </Link>
              </li>
              <li>
                <Link
                  to={"/dnd/damage-half"}
                  title="Ex: 1d20 DC:15 Damage:3d6half"
                >
                  Half Damage&#40;half&#41;: By writing "half" in Damage, all
                  failures are half damage.
                </Link>
              </li>
            </ul>
          </div>
          <div className="Home-col">
            <h1>Chart</h1>
            <p>
              The x-axis shows the number rolled, while the y-axis shows the
              probability. By hoving over the graph bars, it's possible to see
              more precise information.
            </p>
            <h2>Legend</h2>
            <p>
              Shows the average, probability of failure, success, and critical.
              Hover for more information.
            </p>
          </div>
        </div>
        <div className="Home-grid">
          <div className="Home-col">
            <h1>GURPS</h1>
            <p>
              Generic and Universal Role Playing System, this rpg system only
              uses six sided dices, and in regular tests the lowest is better.
            </p>
            <ul>
              <li>
                <Link to={"/gurps"} title="Ex: 3d6">
                  Default Dice&#40;3d6&#41;
                </Link>
              </li>
              <li>
                <Link to={"/gurps/difficulty-gurps"} title="Ex: 3d6 NH:12">
                  Difficulty&#40;NH&#41;: Numbers below NH are success, while
                  above are failure.
                </Link>
              </li>
              <li>
                <Link to={"/gurps/critical-gurps"} title="Ex: 3d6 NH:18">
                  Critical: Number 3 and 4 always are critical success, while 17
                  and 18 always are a failure. When a number is below NH-10, it
                  also is a critical success.
                </Link>
              </li>
            </ul>
          </div>
          <div className="Home-col">
            <h1>D&D</h1>
            <p>
              One of the most popular rpgs, this game uses dices of all
              different sides, but in general, tests uses a d20 and the highest
              value is better.
            </p>
            <ul>
              <li>
                <Link to={"/dnd"} title="Ex: 1d20">
                  Default Dice&#40;1d20&#41;
                </Link>
              </li>
              <li>
                <Link to={"/dnd/difficulty"} title="Ex: 1d20 DC:15">
                  Difficulty&#40;DC&#41;: Numbers below DC are a failure, while
                  above are success.
                </Link>
              </li>
              <li>
                <Link
                  to={"/dnd/critical-dnd"}
                  title="Ex: 1d20 DC:15 Damage:3d6 Crit:3d6"
                >
                  Critical: Number 20 always is a critical success, while 1
                  always is a failure. Normally, a critical hit means you can
                  roll addicional dices.
                </Link>
              </li>
              <li>
                <Link
                  to={"/dnd/xcritical-dnd"}
                  title="Ex: 1d20 DC:15 Damage:3d6 Crit:3d6x"
                >
                  Extended Critical&#40;x&#41;: By writing "x" in Critical, 19
                  and 20 are critical hits.
                </Link>
              </li>
              <li>
                <Link to={"/dnd/status"} title="Ex: 4d6~1">
                  Status&#40;~&#41;: To receive a character stat, you roll 4d6
                  and remove the lowest.
                </Link>
              </li>
              <li>
                <Link to={"/dnd/reroll"} title="Ex: 1d20r1">
                  Reroll&#40;r&#41;: Numbers below "x" are rerolled, like if you
                  are a halfing an 1 is rerolled.
                </Link>
              </li>
              <li>
                <Link to={"/dnd/health"} title="Ex: 1d8h">
                  Always Reroll&#40;h&#41;: Used for character hitpoints.
                </Link>
              </li>
            </ul>
          </div>
          <div className="Home-col">
            <h1>Call of Cthulhu</h1>
            <p>
              This horror rpg system uses 1d100 in regular tests, where the
              lowest is better.
            </p>
            <ul>
              <li>
                <Link to={"/coc"} title="Ex: 1d100">
                  Default Dice&#40;1d100&#41;
                </Link>
              </li>
              <li>
                <Link to={"/coc/difficulty-coc"} title="Ex: 1d100 DC60">
                  Difficulty&#40;DC&#41;: Numbers below DC are success, while
                  above are failure.
                </Link>
              </li>
              <li>
                <Link to={"/coc/difficulty-coc"} title="Ex: 1d100 DC60">
                  Hard Success: Numbers below half the DC
                </Link>
              </li>
              <li>
                <Link to={"/coc/difficulty-coc"} title="Ex: 1d100 DC60">
                  Extreme Success: Numbers below one fifth the DC
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </main>
    );
  }
}

export default Home;
