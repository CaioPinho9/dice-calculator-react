import Chart, { ChartItem } from "chart.js/auto";
// @ts-ignore
import Dice from "./Dice.ts";
// @ts-ignore
import Dictionary from "./Dictionary.ts";

export default class Controller {
  public chart: Chart;
  public chartData: { labels: Number[]; datasets: any[] };
  public submitData: any[];
  public rpgSystem: string;
  public normalProbability: Dictionary[] = [];
  public damageProbability: Dictionary = new Dictionary();

  public Interpreter(submitData: any[], rpgSystem: string) {
    this.submitData = submitData;
    this.rpgSystem = rpgSystem;
    submitData.forEach((line) => {
      let dices: string = line.dices.toLowerCase();
      let damage: string =
        line.damage !== null ? line.damage.toLowerCase() : "";

      dices = dices.replace(" ", "");
      dices = dices.replace("-", "+-");
      damage = damage.replace(" ", "");
      damage = damage.replace("-", "+-");

      if (
        !dices.match(/([0-9d><r~])+/) ||
        (!damage.match(/([0-9d><r~])+/) && damage !== "")
      ) {
        return;
      }

      const expressionChance = this.ExpressionChance(dices);

      const damageChance = damage !== "" ? this.ExpressionChance(damage) : null;

      const chancesPlusBonus: Dictionary = Dice.DeslocateProbability(
        expressionChance,
        Number(line.bonus)
      );

      if (!line.extends) {
        this.normalProbability.push(chancesPlusBonus);
      } else {
        if (this.damageProbability === null) {
          this.damageProbability = chancesPlusBonus;
        } else {
          this.damageProbability = Dice.MergeChances(
            this.damageProbability,
            chancesPlusBonus
          );
        }
      }

      this.FormatData(this.normalProbability[0]);
    });
  }

  private ExpressionChance(expression: string) {
    const dicesPlusSeparation: string[] = expression.split("+");
    let chances: Dictionary[] = [];
    let sum: boolean[] = [];

    dicesPlusSeparation.forEach((separation) => {
      let reRoll: number;
      let health: boolean = false;

      if (separation.includes("-")) {
        separation = separation.replace("-", "");
        sum.push(false);
      } else {
        sum.push(true);
      }

      if (separation.includes("h")) {
        separation = separation.replace("h", "");
        reRoll = 1;
        health = true;
      }

      if (separation.includes("r")) {
        const rerollArray: string[] = this.Reroll(separation);
        separation = rerollArray[0];
        reRoll = Number(rerollArray[1]);
      } else {
        reRoll = 0;
      }

      if (
        separation.includes(">") ||
        separation.includes("<") ||
        separation.includes("~")
      ) {
        chances.push(this.Advantage(separation, reRoll));
      } else {
        chances.push(this.NormalChance(separation, reRoll, health));
      }
    });

    for (let index = 1; index < chances.length; index++) {
      chances[0] = Dice.MergeChances(chances[0], chances[index], sum[index]);
    }

    return chances[0];
  }

  private Reroll(separation: string): string[] {
    const splited: string[] = separation.split("r");
    let dice: string = splited[0];
    let reRoll: string = splited[1];
    return [dice, reRoll];
  }

  private Advantage(separation: string, reRoll: number) {
    let nDice: string;
    let sides: string;
    let positive: boolean = true;
    let nKeep: number = 1;

    if (separation.includes(">")) {
      const splited = separation.split(">d");
      nDice = splited[0];
      sides = splited[1];
    } else if (separation.includes("<")) {
      const splited = separation.split("<d");
      nDice = splited[0];
      sides = splited[1];
      positive = false;
    } else if (separation.includes("~")) {
      let splited = separation.split("d");
      nDice = splited[0];
      splited = splited[1].split("~");
      sides = splited[0];
      nKeep = Number(nDice) - Number(splited[1]);
    } else {
      return false;
    }

    const check: string[] = this.CheckNull(nDice, sides);
    nDice = check[0];
    sides = check[1];

    return Dice.AdvantageChances(
      Number(nDice),
      Number(sides),
      positive,
      nKeep,
      reRoll !== 0
    );
  }

  private NormalChance(separation: string, reRoll: number, health: boolean) {
    let nDice: string;
    let sides: string;
    const splited = separation.split("d");
    nDice = splited[0];
    sides = splited[1];

    const check: string[] = this.CheckNull(nDice, sides);
    nDice = check[0];
    sides = check[1];

    if (reRoll === 0) {
      return Dice.Chances(nDice, sides);
    } else {
      return Dice.ChancesReroll(nDice, sides, reRoll, health);
    }
  }

  private CheckNull(nDice: string, sides: string): string[] {
    if (nDice.match(/^[0-9]+$/) == null || nDice === "0") {
      if (this.rpgSystem === "gurps") {
        nDice = "3";
      } else {
        nDice = "1";
      }
    }
    if (sides.match(/^[0-9]+$/) == null || sides === "0") {
      switch (this.rpgSystem) {
        case "gurps":
          sides = "6";
          break;
        case "dnd":
          sides = "20";
          break;
        case "coc":
          sides = "100";
          break;
      }
    }
    return [nDice, sides];
  }

  private DictionarytoArray(dictionary: Dictionary): number[] {
    let array: any[] = [];
    const min: number = dictionary.min();
    for (let key = 0; key <= dictionary.max() - min; key++) {
      array[key] = dictionary.get(key + min);
    }
    return array;
  }

  private FormatData(normalProbability: Dictionary) {
    let labels: number[] = [];
    for (let i = normalProbability.min(); i <= normalProbability.max(); i++) {
      labels.push(i);
    }

    this.chartData = {
      labels: labels,
      datasets: [
        {
          skipNull: true,
          label: "100%",
          backgroundColor: "rgb(20, 152, 222)",
          borderColor: "rgb(20, 152, 222)",
          borderRadius: 5,
          minBarThickness: 30,
          maxBarThickness: 100,
          data: this.DictionarytoArray(normalProbability),
          stack: "Stack 0",
        },
      ],
    };
    let text = this.submitData[0].dices;

    this.ConfigChart(text, this.chartData, false);
  }

  private ConfigChart(text: String, chartData: any, reverse: boolean): void {
    let config = {
      type: "bar",
      data: chartData,
      options: {
        plugins: {
          title: {
            display: true,
            text: text,
            color: "white",
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
              color: "white",
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
              color: "white",
            },
            stacked: true,
          },
          y: {
            ticks: {
              color: "white",
            },
            stacked: true,
          },
          percentage: {
            type: "linear",
            position: "right",
            ticks: {
              color: "white",
            },
          },
        },
      },
    };
    this.RenderGraph(config);
  }

  private RenderGraph(config: any): void {
    // Destroy old graph
    if (this.chart) {
      this.chart.destroy();
    }

    // Render chart
    this.chart = new Chart(
      document.getElementById("chart") as ChartItem,
      config
    );
  }
}
