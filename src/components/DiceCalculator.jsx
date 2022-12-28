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
      lastId: 0,
    };
  }

  componentDidMount() {
    this.setState({ formQnt: 1 });
    this.startForms();
    this.createExample();
  }

  render() {
    return (
      <div className="Calculator-main">
        <form className="Calculator-form" action="">
          {this.state.forms}
          <input
            className="Form-btn"
            style={{
              width: "15vmin",
              marginLeft: "15px",
              marginRight: "15px",
              marginTop: "10px",
            }}
            type="submit"
            value="Submit"
            onClick={(e) => this.handleSubmit(e)}
          />
          <div className="break"></div>
          {this.legends()}
          <canvas id="chart" className="Calculator-chart"></canvas>
        </form>
      </div>
    );
  }

  startForms() {
    let forms = [
      <Form
        key={"Form" + 0}
        id={0}
        rpgSystem={this.props.rpgSystem}
        onChange={this.handleFormChange}
        onIncreaseForms={this.increaseForms}
        onDecreaseForms={this.decreaseForms}
        first={true}
      />,
    ];
    this.setState({ forms: forms });
  }

  increaseForms = () => {
    let forms = this.state.forms.map((value) => {
      return value;
    });

    let lastId = ++this.state.lastId;
    forms.push(
      <Form
        key={"Form" + lastId}
        id={lastId}
        rpgSystem={this.props.rpgSystem}
        onChange={this.handleFormChange}
        onIncreaseForms={this.increaseForms}
        onDecreaseForms={this.decreaseForms}
        first={false}
      />
    );

    this.setState({ forms: forms });
    this.setState({ formQnt: this.state.formQnt + 1 });
    this.setState({ lastId: lastId });
  };

  decreaseForms = (id) => {
    if (this.state.formQnt > 1) {
      let removeIndex = 0;
      let index = 0;
      let forms = this.state.forms.reduce(function (result, element) {
        if (element.props.id !== id) {
          result.push(element);
        } else {
          removeIndex = index;
        }
        index++;
        return result;
      }, []);
      index = 0;
      let data = this.state.formData.reduce(function (result, element) {
        if (index !== removeIndex) {
          result.push(element);
        }
        index++;
        return result;
      }, []);
      this.setState({ forms: forms });
      this.setState({ formData: data });
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

    this.handleChart(this.state.formData);
  };

  legends = () => {
    let rows = [];
    let key = 0;
    this.state.legends.forEach((legend) => {
      let collumns = [];
      legend.value.forEach((collumn, index) => {
        let colors = [];
        let text = [];
        let gray = `#a3b6d8`;
        if (legend.value.length === 1) {
          colors = [gray];
          text = ["Average"];
        } else if (legend.value.length === 3) {
          colors = [gray, legend.colors.red, legend.colors.blue];
          text = ["Average", "Failure", "Success"];
        } else if (legend.value.length === 4) {
          colors = [
            gray,
            legend.colors.red,
            legend.colors.blue,
            legend.colors.green,
          ];
          text = ["Average", "Failure", "Success", "Critical"];
        } else {
          colors = [
            gray,
            legend.colors.red,
            legend.colors.yellow,
            legend.colors.blue,
            legend.colors.green,
          ];
          text = ["Average", "Fail", "Normal", "Hard", "Extreme"];
        }
        collumns.push(
          <div
            title={text[index]}
            className="Chart-legends"
            style={{ backgroundColor: colors[index] }}
          >
            <p key={key}>{collumn}</p>
          </div>
        );
      });
      key++;
      rows.push(<div style={{ margin: "10px" }}>{collumns}</div>);
    });
    return <div className="Chart-container">{rows}</div>;
  };

  createExample = () => {
    var url = window.location.href.split("/");
    var example = url[url.length - 1];
    var formData = [
      {
        id: 0,
        dices: "",
        bonus: "",
        dc: "",
        damage: "",
        crit: "",
        extended: false,
      },
    ];

    switch (example) {
      case "dices":
        formData[0].dices = "2d8";
        break;

      case "addition":
        formData[0].dices = "1d6+1d4";
        formData[0].bonus = "2";
        break;

      case "multiplication":
        formData[0].dices = "4d6*3";
        break;

      case "advantage":
        formData[0].dices = "2>d20";
        break;

      case "disadvantage":
        formData[0].dices = "2<d20";
        break;

      case "difficulty":
        formData[0].dices = "1d20";
        formData[0].dc = "15";
        break;

      case "damage":
        formData[0].dices = "1d20";
        formData[0].dc = "15";
        formData[0].damage = "3d6";
        formData[0].extended = "true";
        break;

      case "damage-half":
        formData[0].dices = "1d20";
        formData[0].dc = "15";
        formData[0].damage = "3d6half";
        formData[0].extended = "true";
        break;

      case "difficulty-gurps":
        formData[0].dices = "3d6";
        formData[0].dc = "12";
        break;

      case "critical-gurps":
        formData[0].dices = "3d6";
        formData[0].dc = "18";
        break;

      case "critical-dnd":
        formData[0].dices = "1d20";
        formData[0].dc = "15";
        formData[0].damage = "3d6";
        formData[0].crit = "3d6";
        formData[0].extended = "true";
        break;

      case "xcritical-dnd":
        formData[0].dices = "1d20";
        formData[0].dc = "15";
        formData[0].damage = "3d6";
        formData[0].crit = "3d6x";
        formData[0].extended = "true";
        break;

      case "status":
        formData[0].dices = "4d6~1";
        break;

      case "reroll":
        formData[0].dices = "1d20r1";
        break;

      case "health":
        formData[0].dices = "1d8h";
        break;

      case "difficulty-coc":
        formData[0].dices = "1d100";
        formData[0].dc = "60";
        break;

      default:
        break;
    }

    this.handleChart(formData);
  };

  handleChart = (formData) => {
    this.state.controller.interpreter(formData, this.props.rpgSystem);

    this.setState({ legends: this.state.controller.legends });

    document.getElementById("chart").style.display = "block";
  };
}

export default DiceCalculator;
