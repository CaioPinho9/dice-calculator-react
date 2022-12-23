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
          <input
            type="button"
            onClick={(e) => {
              this.setState({ extended: !this.state.extended });
              e.preventDefault();
            }}
            value={this.state.extended ? "Damage" : "Default"}
          ></input>
        </label>
        <label htmlFor="">
          <p>Dices</p>
          <input
            style={{ width: "20vmin" }}
            type="text"
            placeholder="Expression"
            value={this.state.dices}
            onChange={(e) => {
              this.setState({ dices: e.target.value });
            }}
          ></input>
        </label>
        {this.props.rpgSystem === "gurps" && (
          <label>
            <p>NH</p>
            <input
              style={{ width: "7vmin" }}
              type="text"
              placeholder="NH"
              onChange={(e) => {
                this.setState({ dc: e.target.value });
              }}
            ></input>
          </label>
        )}
        {this.props.rpgSystem !== "coc" && (
          <React.Fragment>
            <label htmlFor="">
              <br />
              <p style={{ paddingBottom: "8px" }}>+</p>
            </label>
            <label>
              <p>Bonus</p>
              <input
                type="text"
                placeholder="Bonus"
                style={{ width: "7vmin" }}
                onChange={(e) => {
                  this.setState({ bonus: e.target.value });
                }}
              ></input>
            </label>
          </React.Fragment>
        )}
        {this.props.rpgSystem !== "gurps" && (
          <label>
            <p>DC</p>
            <input
              style={{ width: "7vmin" }}
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
                style={{ width: "18vmin" }}
                type="text"
                placeholder="Damage"
                value={this.state.damage}
                onChange={(e) => {
                  this.setState({ damage: e.target.value });
                }}
              ></input>
            </label>
            {this.props.rpgSystem !== "gurps" && (
              <label>
                <p>Crit</p>
                <input
                  style={{ width: "18vmin" }}
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
