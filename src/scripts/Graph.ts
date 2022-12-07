// @ts-ignore
import Color from "./Color.ts";
// @ts-ignore
import Controller from "./Controller.ts";
// @ts-ignore
import Test from "./Test.ts";

export default class Graph {
  private chartData: { labels: Number[]; datasets: any[] };
  private submitData: any[];
  private rpgSystem: string;
  private tests: Test[];
  private config: any;

  constructor(submitData: any[], rpgSystem: string, tests: Test[]) {
    this.submitData = submitData;
    this.rpgSystem = rpgSystem;
    this.tests = tests;
    this.formatData();
  }

  private labels(): Set<number> {
    let labels = new Set<number>();
    this.tests.forEach((test): void => {
      for (let i = test.normal.min(); i <= test.normal.max(); i++) {
        labels.add(i);
      }
      if (test.damage.sum() !== 0) {
        for (let i: number = test.damage.min(); i <= test.damage.max(); i++) {
          labels.add(i);
        }
      }
      if (test.critical.sum() !== 0) {
        for (
          let i: number = test.critical.min();
          i <= test.critical.max();
          i++
        ) {
          labels.add(i);
        }
      }
    });

    return labels;
  }

  private datasets() {
    let datasets: any[] = [];
    let index = 0;

    for (; index < this.tests.length; index++) {
      if (!this.tests[index].extended) {
        datasets.push({
          label: "Test " + (index + 1),
          backgroundColor: this.backgroundColors(index),
          borderColor: this.backgroundColors(index),
          borderRadius: 5,
          minBarThickness: 30,
          maxBarThickness: 100,
          data: this.tests[index].normal.toPercent().toArray(),
          stack: "Stack " + index,
        });
      } else {
        datasets.push({
          label: "Damage",
          backgroundColor: this.backgroundColors(index),
          borderColor: this.backgroundColors(index),
          borderRadius: 5,
          minBarThickness: 30,
          maxBarThickness: 100,
          data: this.tests[index].damage.toPercent().toArray(),
          stack: "Stack " + index,
        });

        if (this.tests[index].critical.sum() !== 0) {
          datasets.push({
            label: "Critical",
            backgroundColor: index === 0 ? Color.green : Color.randomGreen(),
            borderColor: index === 0 ? Color.green : Color.randomGreen(),
            borderRadius: 5,
            minBarThickness: 30,
            maxBarThickness: 100,
            data: this.tests[index].critical
              .toPercent(this.tests[index].damage)
              .toArray(),
            stack: "Stack " + index,
          });
        }
      }
    }

    return datasets;
  }

  private backgroundColors(index: number) {
    let colors: string[] = [];
    const green: string = index === 0 ? Color.green : Color.randomGreen();
    const blue: string = index === 0 ? Color.blue : Color.randomBlue();
    const yellow: string = index === 0 ? Color.yellow : Color.randomYellow();
    const red: string = index === 0 ? Color.red : Color.randomRed();
    let normal: boolean =
      this.submitData[index].dices === "" ||
      (this.submitData[index].dices === "3d6" && this.rpgSystem === "gurps") ||
      (this.submitData[index].dices === "1d100" && this.rpgSystem === "coc") ||
      (this.submitData[index].dices.includes("d20") &&
        this.rpgSystem === "dnd");

    if (!this.tests[index].extended) {
      if (this.tests[index].dc !== 0) {
        for (
          let key = this.tests[index].normal.min();
          key <= this.tests[index].normal.max();
          key++
        ) {
          if (this.rpgSystem === "dnd") {
            if (normal) {
              if (key < this.tests[index].dc) {
                colors.push(red);
              } else if (key < 20) {
                colors.push(blue);
              } else {
                colors.push(green);
              }
            } else {
              if (key < this.tests[index].dc) {
                colors.push(red);
              } else {
                colors.push(blue);
              }
            }
          } else if (this.rpgSystem === "coc") {
            if (normal) {
              if (key <= this.tests[index].dc / 5) {
                colors.push(green);
              } else if (key <= this.tests[index].dc / 2) {
                colors.push(blue);
              } else if (key <= this.tests[index].dc) {
                colors.push(yellow);
              } else {
                colors.push(red);
              }
            } else {
              if (key >= this.tests[index].dc) {
                colors.push(red);
              } else {
                colors.push(blue);
              }
            }
          } else {
            if (key > this.tests[index].dc || (key >= 17 && normal)) {
              colors.push(red);
            } else if (
              (key <= this.tests[index].dc - 10 || key <= 4) &&
              normal
            ) {
              colors.push(green);
            } else {
              colors.push(blue);
            }
          }
        }
      } else {
        return [blue];
      }
    } else {
      for (let key = 0; key <= this.tests[index].damage.max(); key++) {
        if (key === 0) {
          colors.push(red);
        } else {
          colors.push(blue);
        }
      }
    }

    return colors;
  }

  private text() {
    let result: string[] = [];
    this.submitData.forEach((line) => {
      let text = "";
      if (line.dices === "") {
        const rpgDefault = Controller.rpgDefault("0", "0", this.rpgSystem);
        text += rpgDefault[0] + "d" + rpgDefault[1];
      } else {
        text += line.dices;
      }

      if (this.rpgSystem !== "gurps" && line.bonus !== "") {
        text += " + " + line.bonus;
      }

      if (line.dc !== "0") {
        if (this.rpgSystem === "gurps") {
          text += " NH" + line.dc;
          if (line.bonus !== "") {
            text += " + " + line.bonus;
          }
        } else {
          text += " DC" + line.dc;
        }
      }

      if (line.damage !== "") {
        text += " Dam:" + line.damage;
      }

      if (line.crit !== "") {
        text += " + " + line.crit;
      }
      result.push(text);
    });
    return result;
  }

  private formatData() {
    let labels = this.labels();

    //Same length data
    Array.from(labels).forEach((label) => {
      this.tests.forEach((test) => {
        if (test.normal.get(label) === undefined) {
          test.normal.set(label, 0);
        }
        if (test.damage.get(label) === undefined) {
          test.damage.set(label, 0);
        }
        if (test.critical.get(label) === undefined) {
          test.critical.set(label, 0);
        }
      });
    });

    let datasets = this.datasets();

    this.chartData = {
      labels: Array.from(labels).sort(function (a, b) {
        return a - b;
      }),
      datasets: datasets,
    };

    const text = this.text();

    this.configChart(text, this.chartData, false);
  }

  private configChart(text: String[], chartData: any, reverse: boolean): void {
    this.config = {
      type: "bar",
      data: chartData,
      options: {
        plugins: {
          title: {
            display: true,
            text: text,
            blue: "black",
            position: "bottom",
            padding: 0,
            font: {
              size: 16,
              weight: 100,
            },
          },
          legend: {
            display: false,
            labels: {
              blue: "black",
            },
            fillStyle: "rgb(20, 152, 222)",
            strokeStyle: "rgb(20, 152, 222)",
          },
        },
        interaction: {
          intersect: true,
        },
        scales: {
          x: {
            reverse: reverse,
            ticks: {
              blue: "black",
            },
            stacked: true,
          },
          y: {
            ticks: {
              blue: "black",
            },
            stacked: true,
          },
          percentage: {
            type: "linear",
            position: "right",
            ticks: {
              blue: "black",
            },
          },
        },
      },
    };
  }

  public getConfig() {
    return this.config;
  }
}
