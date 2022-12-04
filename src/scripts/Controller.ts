import Chart, { ChartItem } from "chart.js/auto";
// @ts-ignore
import Graph from "./Graph.ts";
// @ts-ignore
import Dice from "./Dice.ts";
// @ts-ignore
import Chances from "./types/Chances.ts";

export default class Controller {
  //Graph object
  public chart: Chart;
  public rpgSystem: string;
  public resultTests: Chances[] = [];
  public resultDamage: Chances = new Chances();
  public dc: string[] = [];

  public Interpreter(formsData: any[], rpgSystem: string) {
    this.rpgSystem = rpgSystem;
    //Refresh
    this.resultTests = [];
    this.resultDamage = new Chances();

    //Process each line from forms
    formsData.forEach((line) => {
      let dices: string;
      let damage: string;

      //Format
      dices = line.dices.toLowerCase();
      dices = dices.replace(" ", "");
      dices = dices.replace("-", "+-");
      dices = dices === "" ? "d" : dices;
      damage = line.damage.toLowerCase();
      damage = damage.replace(" ", "");
      damage = damage.replace("-", "+-");

      if (
        (!dices.match(/([0-9d><r~])+/) && dices !== "") ||
        (!damage.match(/([0-9d><r~])+/) && damage !== "")
      ) {
        return;
      }

      if (!line.extended) {
        if (rpgSystem === "gurps") {
          this.dc.push(String(Number(line.dc) + Number(line.bonus)));
        } else {
          this.dc.push(String(Number(line.dc)));
        }
      }

      let expressionChance = this.ExpressionChance(dices);

      if (rpgSystem !== "gurps") {
        expressionChance = Dice.DeslocateProbability(
          expressionChance,
          Number(line.bonus)
        );
      }

      if (dices.includes("d")) {
        if (line.damage === "") {
          //Normal test
          this.resultTests.push(expressionChance);
        } else {
          //Damage test
          //Gurps dc/nh uses bonus
          const dc =
            rpgSystem === "gurps"
              ? Number(line.dc) + Number(line.bonus)
              : Number(line.dc);
          //Success probability
          const success = this.SuccessProbability(
            dc,
            expressionChance,
            rpgSystem
          );
          //Damage chance
          const damageChance = this.ExpressionChance(damage);

          //Chance of zero damage
          damageChance.set(
            0,
            Math.round((damageChance.sum() * (1 - success)) / success)
          );

          //Merge the damage with resultDamage
          if (this.resultDamage.size() === 0) {
            this.resultDamage = damageChance;
          } else {
            this.resultDamage = Dice.MergeChances(
              this.resultDamage,
              damageChance
            );
          }
        }
      } else {
        //Number only
        let dict = new Chances();
        dict.set(Number(dices), 1);
        this.resultTests.push(dict);
      }
    });
    this.BuildChart(formsData, rpgSystem);
  }

  /**
   *
   * @param expression ""
   * @returns Chances
   */
  private ExpressionChance(expression: string) {
    const dicesPlusSeparation: string[] = expression.split("+");
    let chances: Chances[] = [];
    let resultChances: Chances = new Chances();
    let sum: boolean[] = [];
    let bonus: number = 0;

    dicesPlusSeparation.forEach((separation) => {
      let reRoll: number;
      let hitDices: boolean = false;

      //Calculate chances only when this separation is a dice
      if (separation.includes("d")) {
        //Sum or minus dice
        if (separation.includes("-")) {
          separation = separation.replace("-", "");
          sum.push(false);
        } else {
          sum.push(true);
        }

        //Check if is a hitdice calculation
        if (separation.includes("h")) {
          separation = separation.replace("h", "");
          reRoll = 1;
          hitDices = true;
        }

        //Check if is a reroll calculation
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
          //Advantage/disadvantage calculation
          chances.push(this.Advantage(separation, reRoll));
        } else {
          //Normal calculation
          chances.push(this.NormalChance(separation, reRoll, hitDices));
        }
      } else {
        bonus += Number(separation);
      }
    });

    //Unify all chances
    resultChances = chances[0];
    for (let index = 1; index < chances.length; index++) {
      resultChances = Dice.MergeChances(
        resultChances,
        chances[index],
        sum[index]
      );
    }

    //Sum the bonus
    resultChances = Dice.DeslocateProbability(resultChances, bonus);

    return resultChances;
  }

  /**
   * @param dc The number used to say where is the success
   * @param chances Chances of each key
   * @param rpgSystem In gurps and coc, the lower is better, while in dnd the higher is better
   * @returns Success probability
   */
  private SuccessProbability(
    dc: number,
    chances: Chances,
    rpgSystem: string
  ): number {
    let successChances: number = 0;

    //Check if key is a success, depending on the system
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

    //Success probability
    return successChances / chances.sum();
  }

  /**
   * @returns dice and reroll separated
   */
  private Reroll(separation: string): string[] {
    const splited: string[] = separation.split("r");
    let dice: string = splited[0];
    let reRoll: string = splited[1];
    return [dice, reRoll];
  }

  /**
   * @param separation Ex: 2>d20, 4d6~1
   * @returns Chances
   */
  private Advantage(separation: string, reRoll: number) {
    let nDice: string;
    let sides: string;
    let positive: boolean = true;
    let nKeep: number = 1;

    if (separation.includes(">")) {
      //Advantage
      const splited = separation.split(">d");
      nDice = splited[0];
      sides = splited[1];
    } else if (separation.includes("<")) {
      //Disadvantage
      const splited = separation.split("<d");
      nDice = splited[0];
      sides = splited[1];
      positive = false;
    } else if (separation.includes("~")) {
      //"nDice"d"sides"~"nRemove"
      let splited = separation.split("d");
      nDice = splited[0];
      splited = splited[1].split("~");
      sides = splited[0];
      //splided[1] = nRemove, how many dices are removed
      //nKeep is how many dices are used in the end
      nKeep = Number(nDice) - Number(splited[1]);
    } else {
      return false;
    }
    const check: string[] = this.rpgDefault(nDice, sides);
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

  /**
   * Receives "nDice"d"sides", split and return chances
   * @param separation "nDice"d"sides"
   * @param reRoll Until which number must reroll
   * @param hitDices Hitdices calcultation always reroll
   * @returns Chances
   */
  private NormalChance(separation: string, reRoll: number, hitDices: boolean) {
    let nDice: string;
    let sides: string;
    const splited = separation.split("d");
    nDice = splited[0];
    sides = splited[1];

    const check: string[] = this.rpgDefault(nDice, sides);
    nDice = check[0];
    sides = check[1];

    if (reRoll === 0) {
      return Dice.Chances(nDice, sides);
    } else {
      //Reroll
      //hitDices checks always reroll ones
      return Dice.ChancesReroll(nDice, sides, reRoll, hitDices);
    }
  }

  /**
   * If nDice or sides is empty, return default value of the system
   */
  private rpgDefault(nDice: string, sides: string): string[] {
    if (nDice === "0" || nDice === "") {
      if (this.rpgSystem === "gurps") {
        nDice = "3";
      } else {
        nDice = "1";
      }
    }
    if (sides === "0" || sides === "") {
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

  /**
   * Config and create chart
   */
  private BuildChart(formsData: any[], rpgSystem: string) {
    //Config chart
    const graph = new Graph(
      formsData,
      rpgSystem,
      this.resultTests,
      this.resultDamage,
      this.dc
    );

    //Destroy old chart
    if (this.chart) {
      this.chart.destroy();
    }

    //Create new chart
    this.chart = new Chart(
      document.getElementById("chart") as ChartItem,
      graph.getConfig()
    );
  }
}
