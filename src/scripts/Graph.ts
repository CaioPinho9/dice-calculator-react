// @ts-ignore
import Controller from "./Controller.ts";
// @ts-ignore
import Test from "./Test.ts";

export default class Graph {
  private graphData: { labels: Number[]; datasets: any[] };
  private formsData: any[];
  private rpgSystem: string;
  private tests: Test[];
  private config: any;
  private rpgDefault: boolean;

  constructor(formsData: any[], rpgSystem: string, tests: Test[]) {
    this.formsData = formsData;
    this.rpgSystem = rpgSystem;
    this.tests = tests;
    this.rpgDefault = false;
    this.formatData();
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
        this.rpgDefault = this.rpgDefault || test.rpgDefault();
      });
    });

    let datasets = this.datasets();

    this.graphData = {
      //Ordering labels
      labels: Array.from(labels).sort(function (a, b) {
        return a - b;
      }),
      datasets: datasets,
    };

    const text = this.graphText();

    this.configGraph(text, this.graphData);
  }

  private labels(): Set<number> {
    let labels = new Set<number>();
    this.tests.forEach((test): void => {
      labels = new Set<number>([...labels, ...test.labels()]);
    });

    return labels;
  }

  private datasets() {
    let datasets: any[] = [];

    this.tests.forEach((test, index) => {
      datasets = datasets.concat(test.datasets(index));
    });

    return datasets;
  }

  private graphText(): string[] {
    let result: string[] = [];
    this.formsData.forEach((line) => {
      let text = "";
      if (line.dices === "") {
        const rpgDefault = Controller.rpgDefault("0", "0", this.rpgSystem);
        text += rpgDefault[0] + "d" + rpgDefault[1];
      } else {
        text += line.dices;
      }

      if (line.bonus !== "" && this.rpgSystem !== "gurps") {
        text += " + " + line.bonus;
      }

      if (line.dc !== "0") {
        if (this.rpgSystem === "gurps") {
          text += " NH" + line.dc;
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

  private configGraph(text: String[], graphData: any): void {
    this.config = {
      type: "bar",
      data: graphData,
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
            reverse: this.rpgSystem !== "dnd" && this.rpgDefault,
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
