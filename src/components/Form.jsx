import React, { Component } from "react";

class Form extends Component {
  state = { damage: false };
  render() {
    return (
      <React.Fragment>
        <label htmlFor="">
          <br />
          <select
            onChange={(e) =>
              this.setState({ damage: e.target.value === "Damage" })
            }
          >
            <option value="Default">Default</option>
            <option value="Damage">Damage</option>
          </select>
        </label>
        <label htmlFor="">
          <p>Dices</p>
          <input type="text" placeholder="Expression"></input>
        </label>
        {this.props.rpgSistem === "gurps" && (
          <label>
            <p>NH</p>
            <input
              style={{ width: "50px" }}
              type="text"
              placeholder="NH"
            ></input>
          </label>
        )}
        <label htmlFor="">
          <br />
          <p style={{ paddingBottom: "8px" }}>+</p>
        </label>
        <label>
          <p>Bonus</p>
          <input
            type="text"
            placeholder="Bonus"
            style={{ width: "50px" }}
          ></input>
        </label>
        {this.props.rpgSistem !== "gurps" && (
          <label>
            <p>DC</p>
            <input
              style={{ width: "50px" }}
              type="text"
              placeholder="DC"
            ></input>
          </label>
        )}
        {this.state.damage && (
          <label>
            <p>Damage</p>
            <input type="text" placeholder="Damage"></input>
          </label>
        )}
        <div className="break"></div>
      </React.Fragment>
    );
  }
}

export default Form;
