import Chart, { ChartItem } from "chart.js/auto";
// @ts-ignore
import Graph from "./Graph.ts";
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
  public dc: string[] = [];

  public Interpreter(submitData: any[], rpgSystem: string) {
    this.normalProbability = [];
    this.damageProbability = new Dictionary();
    this.submitData = submitData;
    this.rpgSystem = rpgSystem;
    this.chartData = {
      labels: [],
      datasets: [],
    };
    submitData.forEach((line) => {
      let dices: string = line.dices !== "" ? line.dices.toLowerCase() : "0d0";
      let damage: string = line.damage !== "" ? line.damage.toLowerCase() : "";

      if (!line.extended) {
        if (rpgSystem === "dnd") {
          this.dc.push(String(Number(line.dc) - Number(line.bonus)));
        } else {
          this.dc.push(String(Number(line.dc) + Number(line.bonus)));
        }
      }

      dices = dices.replace(" ", "");
      dices = dices.replace("-", "+-");
      damage = damage.replace(" ", "");
      damage = damage.replace("-", "+-");

      if (
        (!dices.match(/([0-9d><r~])+/) && dices !== "") ||
        (!damage.match(/([0-9d><r~])+/) && damage !== "")
      ) {
        return;
      }

      let expressionChance = this.ExpressionChance(dices);

      if (rpgSystem !== "gurps") {
        expressionChance = Dice.DeslocateProbability(
          expressionChance,
          Number(line.bonus)
        );
      }

      if (line.damage === "") {
        this.normalProbability.push(expressionChance);
      } else {
        const dc =
          rpgSystem === "gurps"
            ? Number(line.dc) + Number(line.bonus)
            : Number(line.dc);
        const success = this.DifficultyClass(dc, expressionChance, rpgSystem);
        const damageChance = this.ExpressionChance(damage);
        damageChance.set(
          0,
          Math.round((damageChance.sum() * (1 - success)) / success)
        );
        if (this.damageProbability.size() === 0) {
          this.damageProbability = damageChance;
        } else {
          this.damageProbability = Dice.MergeChances(
            this.damageProbability,
            damageChance
          );
        }
      }
    });
    this.BuildChart();
  }

  private ExpressionChance(expression: string) {
    const dicesPlusSeparation: string[] = expression.split("+");
    let chances: Dictionary[] = [];
    let sum: boolean[] = [];
    let bonus: number = 0;

    dicesPlusSeparation.forEach((separation) => {
      let reRoll: number;
      let health: boolean = false;

      if (!separation.includes("d")) {
        bonus += Number(separation);
      }

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

    chances[0] = Dice.DeslocateProbability(chances[0], bonus);

    return chances[0];
  }

  private DifficultyClass(
    dc: number,
    chances: Dictionary,
    rpgSystem: string
  ): number {
    let successChances: number = 0;

    chances.getKeys().forEach((key: number) => {
      if (rpgSystem === "gurps" || rpgSystem === "coc") {
        if (dc >= key) {
          successChances += chances.get(key);
        }
      } else {
        if (dc <= key) {
          successChances += chances.get(key);
        }
      }
    });

    return successChances / chances.sum();
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

  private BuildChart() {
    const graph = new Graph(
      this.chartData,
      this.submitData,
      this.rpgSystem,
      this.normalProbability,
      this.damageProbability,
      this.dc
    );

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(
      document.getElementById("chart") as ChartItem,
      graph.getConfig()
    );
  }
}
