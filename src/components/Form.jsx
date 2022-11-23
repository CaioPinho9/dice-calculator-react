import React, { Component } from "react";

class Form extends Component {
  state = {
    id: this.props.id,
    dices: "",
    bonus: "",
    dc: "",
    damage: "",
    crit: "",
    extended: false,
  };
  render() {
    return (
      <React.Fragment>
        <label htmlFor="">
          <br />
          <select
            onChange={(e) => {
              this.setState({ extended: e.target.value === "Damage" });
            }}
          >
            <option value="Default">Default</option>
            <option value="Damage">Damage</option>
          </select>
        </label>
        <label htmlFor="">
          <p>Dices</p>
          {this.state.extended && (
            <input
              style={{ width: "75px" }}
              type="text"
              placeholder="Expression"
              value={this.state.dices}
              onChange={(e) => {
                this.setState({ dices: e.target.value });
              }}
            ></input>
          )}
          {!this.state.extended && (
            <input
              type="text"
              placeholder="Expression"
              value={this.state.dices}
              onChange={(e) => {
                this.setState({ dices: e.target.value });
              }}
            ></input>
          )}
        </label>
        {this.props.rpgSistem === "gurps" && (
          <label>
            <p>NH</p>
            <input
              style={{ width: "50px" }}
              type="text"
              placeholder="NH"
              onChange={(e) => {
                this.setState({ dc: e.target.value });
              }}
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
            onChange={(e) => {
              this.setState({ bonus: e.target.value });
            }}
          ></input>
        </label>
        {this.props.rpgSistem !== "gurps" && (
          <label>
            <p>DC</p>
            <input
              style={{ width: "50px" }}
              type="text"
              placeholder="DC"
              onChange={(e) => {
                this.setState({ dc: e.target.value });
              }}
            ></input>
          </label>
        )}
        {this.state.extended && (
          <React.Fragment>
            <label>
              <p>Damage</p>
              <input
                style={{ width: "150px" }}
                type="text"
                placeholder="Damage"
                value={this.state.damage}
                onChange={(e) => {
                  this.setState({ damage: e.target.value });
                }}
              ></input>
            </label>
            {this.props.rpgSistem !== "gurps" && (
              <label>
                <p>Crit</p>
                <input
                  style={{ width: "75px" }}
                  type="text"
                  placeholder="Crit"
                  value={this.state.crit}
                  onChange={(e) => {
                    this.setState({ crit: e.target.value });
                  }}
                ></input>
              </label>
            )}
          </React.Fragment>
        )}
        <div className="break"></div>
      </React.Fragment>
    );
  }

  componentDidUpdate() {
    var form;
    if (this.state.extended) {
      form = {
        id: this.props.id,
        dices: this.state.dices,
        bonus: this.state.bonus,
        dc: this.state.dc,
        damage: this.state.damage,
        crit: this.state.crit,
        extended: this.state.extended,
      };
    } else {
      form = {
        id: this.props.id,
        dices: this.state.dices,
        bonus: this.state.bonus,
        dc: this.state.dc,
        damage: "",
        crit: "",
        extended: this.state.extended,
      };
    }
    this.props.onChange(form);
  }
}

export default Form;
