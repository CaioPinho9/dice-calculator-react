import React, { Component } from "react";
import "./DiceCalculator.css";
import Form from "./Form";
// @ts-ignore
import Controller from "../scripts/Controller.ts";

class DiceCalculator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formQnt: 1,
      formData: [],
      forms: [],
      legends: [],
      controller: new Controller(),
    };
  }

  componentDidMount() {
    this.setState({ formQnt: 1 });
    this.changeForm();
  }

  render() {
    return (
      <div className="Calculator-main">
        <form className="Calculator-form" action="">
          <div className="break"></div>
          {this.state.forms}
          <input
            className="Form-btn"
            onClick={this.increaseForms}
            type="button"
            value="+"
          />
          <input
            className="Form-btn"
            style={{
              height: "min-content",
              width: "95px",
              marginLeft: "15px",
              marginRight: "15px",
            }}
            type="submit"
            value="Submit"
            onClick={(e) => this.handleSubmit(e)}
          />
          <input
            className="Form-btn"
            onClick={this.decreaseForms}
            type="button"
            value="-"
          />
          <div className="break"></div>
          {this.legends()}
          <canvas id="chart" className="Calculator-chart"></canvas>
        </form>
      </div>
    );
  }

  componentDidUpdate(_prevProps, prevState) {
    if (prevState.formQnt !== this.state.formQnt) {
      this.changeForm();
    }
  }

  changeForm() {
    let forms = [];
    for (let i = 0; i < this.state.formQnt; i++) {
      forms.push(
        <Form
          key={i}
          id={i}
          rpgSystem={this.props.rpgSystem}
          onChange={this.handleFormChange}
        />
      );
    }
    this.setState({ forms: forms });
  }

  increaseForms = () => {
    this.setState({ formQnt: this.state.formQnt + 1 });
  };

  decreaseForms = () => {
    if (this.state.formQnt > 1) {
      let form = this.state.formData;
      form.pop();
      this.setState({ formData: form });
      this.setState({ formQnt: this.state.formQnt - 1 });
    }
  };

  handleFormChange = (form) => {
    let newForm = [];

    this.state.formData.forEach((formElement) => {
      newForm.push(formElement);
    });

    if (newForm.length >= form.id + 1) {
      newForm[form.id] = form;
    } else {
      newForm.push(form);
    }

    this.setState({ formData: newForm });
  };

  handleSubmit = (e) => {
    e.preventDefault();

    this.setState(
      this.state.controller,
      this.state.controller.interpreter(
        this.state.formData,
        this.props.rpgSystem
      )
    );

    this.setState({ legends: this.state.controller.legends });

    document.getElementById("canvas").style.display = "block";
  };

  legends = () => {
    let rows = [];
    let key = 0;
    this.state.legends.forEach((legend) => {
      let collumns = [];
      legend.value.forEach((collumn, index) => {
        let colors = [];
        let text = [];
        if (legend.value.length === 1) {
          colors = [legend.colors.blue];
          text = ["Normal"];
        } else if (legend.value.length === 2) {
          colors = [legend.colors.red, legend.colors.blue];
          text = ["Fail", "Success"];
        } else if (legend.value.length === 3) {
          colors = [legend.colors.red, legend.colors.blue, legend.colors.green];
          text = ["Fail", "Success", "Critical"];
        } else {
          colors = [
            legend.colors.red,
            legend.colors.yellow,
            legend.colors.blue,
            legend.colors.green,
          ];
          text = ["Fail", "Normal", "Hard", "Extreme"];
        }
        collumns.push(
          <div
            className="Chart-legends"
            style={{ backgroundColor: colors[index] }}
          >
            <p title={text[index]} key={key}>
              {collumn}
            </p>
          </div>
        );
      });
      key++;
      rows.push(
        <div className="Chart-legend-row" style={{ margin: "20px" }}>
          {collumns}
        </div>
      );
    });
    return <div className="Chart-container">{rows}</div>;
  };
}

export default DiceCalculator;
