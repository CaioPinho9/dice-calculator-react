// @ts-ignore
import Chances from "./types/Chances.ts";
// @ts-ignore
import Utils from "./Utils.ts";

export default class Graph {
  private chartData: { labels: Number[]; datasets: any[] };
  private submitData: any[];
  private rpgSystem: string;
  private normalProbability: Chances[] = [];
  private damageProbability: Chances = new Chances();
  private dc: string[];
  private config: any;

  constructor(
    submitData: any[],
    rpgSystem: string,
    normalProbability: Chances[],
    damageProbability: Chances,
    dc: string[]
  ) {
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
        data: this.normalProbability[index].toPercent().toArray(),
        stack: "Stack " + index,
      });
    }

    datasets.push({
      label: "Damage",
      backgroundColor: this.DamageColors(index),
      borderColor: this.DamageColors(index),
      borderRadius: 5,
      minBarThickness: 30,
      maxBarThickness: 100,
      data: this.damageProbability.toPercent().toArray(),
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

  private DamageColors(index: number) {
    let colors: string[] = [];
    let color: string = Utils.RandomColor(index === 0);

    for (let key = 0; key <= this.damageProbability.max(); key++) {
      if (key === 0) {
        colors.push("rgb(255,0,0)");
      } else {
        colors.push(color);
      }
    }
    return colors;
  }

  private text() {
    let text = "";
    return text;
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

    const text = this.text();

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