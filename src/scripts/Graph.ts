// @ts-ignore
import Dictionary from "./Dictionary.ts";
// @ts-ignore
import Utils from "./Utils.ts";

export default class Graph {
  private chartData: { labels: Number[]; datasets: any[] };
  private submitData: any[];
  private rpgSystem: string;
  private normalProbability: Dictionary[] = [];
  private damageProbability: Dictionary = new Dictionary();
  private dc: string[];
  private config: any;

  constructor(
    chartData: { labels: Number[]; datasets: any[] },
    submitData: any[],
    rpgSystem: string,
    normalProbability: Dictionary[],
    damageProbability: any,
    dc: string[]
  ) {
    this.chartData = chartData;
    this.submitData = submitData;
    this.rpgSystem = rpgSystem;
    this.normalProbability = normalProbability;
    this.damageProbability = damageProbability;
    this.dc = dc;
    this.FormatData();
  }

  private Labels(): Set<number> {
    let labels = new Set<number>();
    this.normalProbability.forEach((element): void => {
      for (let i = element.min(); i <= element.max(); i++) {
        labels.add(i);
      }
    });

    for (
      let i: number = this.damageProbability.min();
      i <= this.damageProbability.max();
      i++
    ) {
      labels.add(i);
    }
    return labels;
  }

  private Datasets() {
    let datasets = [{}];
    let index = 0;

    for (; index < this.normalProbability.length; index++) {
      datasets.push({
        label: "Test " + (index + 1),
        backgroundColor: this.BackgroundColors(index),
        borderColor: this.BackgroundColors(index),
        borderRadius: 5,
        minBarThickness: 30,
        maxBarThickness: 100,
        data: Utils.ChanceToPercent(this.normalProbability[index]).toArray(),
        stack: "Stack " + index,
      });
    }

    datasets.push({
      label: "Damage",
      backgroundColor: Utils.RandomColor(index === 0),
      borderColor: Utils.RandomColor(index === 0),
      borderRadius: 5,
      minBarThickness: 30,
      maxBarThickness: 100,
      data: Utils.ChanceToPercent(this.damageProbability).toArray(),
      stack: "Stack " + index,
    });
    return datasets;
  }

  private BackgroundColors(index: number) {
    let colors: string[] = [];
    if (this.dc[index] !== "") {
      for (
        let key = this.normalProbability[index].min();
        key <= this.normalProbability[index].max();
        key++
      ) {
        if (this.rpgSystem === "dnd") {
          if (key < Number(this.dc[index])) {
            colors.push("rgb(255,0,0)");
          } else {
            colors.push(Utils.RandomColor(index === 0));
          }
        } else {
          if (key > Number(this.dc[index])) {
            colors.push("rgb(255,0,0)");
          } else {
            colors.push(Utils.RandomColor(index === 0));
          }
        }
      }
    } else {
      return [Utils.RandomColor(index === 0)];
    }
    return colors;
  }

  private FormatData() {
    let labels = this.Labels();

    //Same length data
    Array.from(labels).forEach((label) => {
      this.normalProbability.forEach((element) => {
        if (element.get(label) === undefined) {
          element.set(label, 0);
        }
      });
      if (this.damageProbability.get(label) === undefined) {
        this.damageProbability.set(label, 0);
      }
    });

    let datasets = this.Datasets();

    this.chartData = {
      labels: Array.from(labels).sort(function (a, b) {
        return a - b;
      }),
      datasets: datasets,
    };

    let text =
      this.submitData[0].dices +
      " " +
      this.submitData[0].bonus +
      " DC" +
      this.submitData[0].dc;

    this.ConfigChart(text, this.chartData, false);
  }

  private ConfigChart(text: String, chartData: any, reverse: boolean): void {
    this.config = {
      type: "bar",
      data: chartData,
      options: {
        plugins: {
          title: {
            display: true,
            text: text,
            color: "black",
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
              color: "black",
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
              color: "black",
            },
            stacked: true,
          },
          y: {
            ticks: {
              color: "black",
            },
            stacked: true,
          },
          percentage: {
            type: "linear",
            position: "right",
            ticks: {
              color: "black",
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
