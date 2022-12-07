import Chart, { ChartItem } from "chart.js/auto";
// @ts-ignore
import Graph from "./Graph.ts";
// @ts-ignore
import Dice from "./Dice.ts";
// @ts-ignore
import Chances from "./types/Chances.ts";
// @ts-ignore
import Test from "./Test.ts";

export default class Controller {
  //Graph object
  public chart: Chart;
  public rpgSystem: string;
  public tests: Test[] = [];

  public interpreter(formsData: any[], rpgSystem: string) {
    this.rpgSystem = rpgSystem;
    //Refresh
    this.tests = [];

    let criticalData: { critical: Chances; probability: number }[] = [];

    //Process each line from forms
    formsData.forEach((line) => {
      let dices: string;
      let damage: string;
      let critical: string;
      //Format
      dices = line.dices.toLowerCase();
      dices = dices.replace(" ", "");
      dices = dices.replace("-", "+-");
      dices = dices === "" ? "d" : dices;
      damage = line.damage.toLowerCase();
      damage = damage.replace(" ", "");
      damage = damage.replace("-", "+-");
      critical = line.crit.toLowerCase();
      critical = critical.replace(" ", "");
      critical = critical.replace("-", "+-");

      //Error when using wrong caracters
      if (
        (!dices.match(/([0-9d><r~])+/) && dices !== "") ||
        (!damage.match(/([0-9d><r~])+/) && damage !== "")
      ) {
        throw new Error("Invalid caracters");
      }

      let testIndex = this.tests.length;
      if (Test.getDamageIndex(this.tests) === -1) {
        this.tests.push(new Test());
      } else {
        testIndex = Test.getDamageIndex(this.tests);
      }

      //DC used to change graph colors
      if (line.dc === "") {
        line.dc = "0";
      }
      if (rpgSystem === "gurps") {
        line.dc = String(Number(line.dc) + Number(line.bonus));
      }
      const dc = Number(line.dc);
      this.tests[testIndex].dc = dc;
      this.tests[testIndex].rpgSystem = rpgSystem;
      this.tests[testIndex].formsData = line;
      this.tests[testIndex].setExtended(line.extended && damage !== "");

      //Main dice probability
      let expressionChance: Chances;
      try {
        expressionChance = this.expressionChance(dices);
      } catch (error) {}

      //Add bonus
      if (rpgSystem !== "gurps" && line.bonus !== "") {
        expressionChance = Dice.deslocateProbability(
          expressionChance,
          Number(line.bonus)
        );
      }

      //Normal test
      if (!this.tests[testIndex].hasDamage()) {
        this.tests[testIndex].normal = expressionChance;
        return;
      }

      //Damage test
      //Success probability
      const success = this.successProbability(dc, expressionChance, rpgSystem);
      //Damage chance
      let damageChance = this.expressionChance(damage);

      //Chance of zero damage
      damageChance.set(0, (damageChance.sum() * (1 - success)) / success);

      //Merge the damage with resultDamage
      if (this.tests[testIndex].damage.size() === 0) {
        this.tests[testIndex].damage = damageChance;
      } else {
        this.tests[testIndex].damage = Dice.mergeChances(
          this.tests[testIndex].damage,
          damageChance,
          true
        );
      }

      if (critical !== "") {
        criticalData.push({
          critical: this.expressionChance(critical),
          probability: this.criticalProbability(expressionChance, dc),
        });
      }
    });

    criticalData.forEach((data) => {
      let damage: Chances = new Chances();
      let index = Test.getDamageIndex(this.tests);

      this.tests[index].damage.getKeys().forEach((key: number) => {
        if (key > 0) {
          damage.set(key, this.tests[index].damage.get(key));
        }
      });

      data.critical = Dice.mergeChances(damage, data.critical, true);

      data.critical.multiply(
        (this.tests[index].damage.sum() * data.probability) /
          (1 - data.probability) /
          data.critical.sum()
      );

      if (this.tests[index].critical.size() === 0) {
        this.tests[index].critical = data.critical;
      } else {
        this.tests[index].critical = Dice.mergeChances(
          this.tests[index].critical,
          data.critical,
          true
        );
      }
    });

    this.buildChart(formsData, rpgSystem);
  }

  /**
   *
   */
  private expressionChance(expression: string): Chances {
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
          const rerollArray: string[] = this.reRoll(separation);
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
          chances.push(this.advantage(separation, reRoll));
        } else {
          //Normal calculation
          chances.push(this.normalChance(separation, reRoll, hitDices));
        }
      } else {
        bonus += Number(separation);
      }
    });

    //Unify all chances
    resultChances = chances[0];
    for (let index = 1; index < chances.length; index++) {
      resultChances = Dice.mergeChances(
        resultChances,
        chances[index],
        sum[index]
      );
    }

    if (expression.includes("d")) {
      //Sum the bonus
      resultChances = Dice.deslocateProbability(resultChances, bonus);
    } else {
      let bonusChance = new Chances();
      bonusChance.set(bonus, 1);
      resultChances = bonusChance;
    }

    return resultChances;
  }

  /**
   * @returns dice and reroll separated
   */
  private reRoll(separation: string): string[] {
    const splited: string[] = separation.split("r");
    let dice: string = splited[0];
    let reRoll: string = splited[1];
    return [dice, reRoll];
  }

  /**
   * @param separation Ex: 2>d20, 4d6~1
   * @returns Chances
   */
  private advantage(separation: string, reRoll: number) {
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
    const check: string[] = Controller.rpgDefault(nDice, sides, this.rpgSystem);
    nDice = check[0];
    sides = check[1];

    return Dice.advantageChances(
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
  private normalChance(separation: string, reRoll: number, hitDices: boolean) {
    let nDice: string;
    let sides: string;
    const splited = separation.split("d");
    nDice = splited[0];
    sides = splited[1];

    const check: string[] = Controller.rpgDefault(nDice, sides, this.rpgSystem);
    nDice = check[0];
    sides = check[1];

    if (reRoll === 0) {
      return Dice.chances(nDice, sides);
    } else {
      //reRoll
      //hitDices checks always reroll ones
      return Dice.chancesReroll(nDice, sides, reRoll, hitDices);
    }
  }

  /**
   * If nDice or sides is empty, return default value of the system
   */
  private static rpgDefault(
    nDice: string,
    sides: string,
    rpgSystem: string
  ): string[] {
    if (nDice === "0" || nDice === "") {
      if (rpgSystem === "gurps") {
        nDice = "3";
      } else {
        nDice = "1";
      }
    }
    if (sides === "0" || sides === "") {
      switch (rpgSystem) {
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
   * @param dc The number used to say where is the success
   * @param chances Chances of each key
   * @param rpgSystem In gurps and coc, the lower is better, while in dnd the higher is better
   * @returns Success probability
   */
  private successProbability(
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

  private criticalProbability(expression: Chances, dc: number): number {
    let crit: number = 0;
    if (this.rpgSystem === "dnd") {
      crit = expression.get(20);
    } else if (this.rpgSystem === "coc") {
      expression.getKeys().forEach((key: number) => {
        if (key <= dc / 5) {
          crit += expression.get(key);
        }
      });
    } else {
      expression.getKeys().forEach((key: number) => {
        if (key <= dc - 10 || key <= 4) {
          crit += expression.get(key);
        }
      });
    }
    crit *= 1 / expression.sum();
    console.log(crit);

    return crit;
  }

  /**
   * Config and create chart
   */
  private buildChart(formsData: any[], rpgSystem: string) {
    //Config chart
    const graph = new Graph(formsData, rpgSystem, this.tests);

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
