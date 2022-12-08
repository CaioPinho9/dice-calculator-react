// @ts-ignore
import Chances from "./types/Chances.ts";
// @ts-ignore
import Color from "./Color.ts";
// @ts-ignore
import Utils from "./Utils.ts";

export default class Test {
  private extended: boolean;
  public dc: number;
  public normal: Chances;
  public damage: Chances;
  public critical: Chances;
  public xCrit: boolean;
  public rpgSystem: string;
  public formsData: any;
  public colors: {
    red: string;
    yellow: string;
    blue: string;
    green: string;
  };

  constructor() {
    this.normal = new Chances();
    this.damage = new Chances();
    this.critical = new Chances();
    this.colors = { red: "", yellow: "", green: "", blue: "" };
    this.xCrit = false;
  }

  public static getDamageIndex(tests: Test[]) {
    let result = -1;
    tests.forEach((test, index) => {
      if (test.extended) {
        result = index;
      }
    });
    return result;
  }

  public labels(): Set<number> {
    let labels = new Set<number>();
    if (!this.hasDamage()) {
      for (let label = this.normal.min(); label <= this.normal.max(); label++) {
        labels.add(label);
      }
    } else {
      for (
        let label: number = this.damage.min();
        label <= this.damage.max();
        label++
      ) {
        labels.add(label);
      }
    }
    if (this.hasCritical()) {
      for (
        let label: number = this.critical.min();
        label <= this.critical.max();
        label++
      ) {
        labels.add(label);
      }
    }
    return labels;
  }

  public datasets(index: number) {
    let datasets: any[] = [];
    if (!this.hasDamage()) {
      datasets.push({
        label: "Test " + (index + 1),
        backgroundColor: this.getBarColors(index),
        borderColor: this.getBarColors(index),
        borderRadius: 20,
        minBarThickness: 30,
        maxBarThickness: 100,
        data: this.normal.toPercent().toArray(),
        stack: "Stack " + index,
      });
    } else {
      datasets.push({
        label: "Damage",
        backgroundColor: this.getBarColors(index),
        borderColor: this.getBarColors(index),
        borderRadius: 20,
        minBarThickness: 30,
        maxBarThickness: 100,
        data: this.damage.toPercent(this.critical).toArray(),
        stack: "Stack " + index,
      });

      if (!this.hasCritical()) {
        return datasets;
      }

      datasets.push({
        label: "Critical",
        backgroundColor: this.colors.green,
        borderColor: this.colors.green,
        borderRadius: 20,
        minBarThickness: 30,
        maxBarThickness: 100,
        data: this.critical.toPercent(this.damage).toArray(),
        stack: "Stack " + index,
      });
    }
    return datasets;
  }

  private getBarColors(index: number) {
    let barColors: string[] = [];
    if (this.colors.red === "") {
      this.colors.green = index === 0 ? Color.green : Color.randomGreen();
      this.colors.blue = index === 0 ? Color.blue : Color.randomBlue();
      this.colors.yellow = index === 0 ? Color.yellow : Color.randomYellow();
      this.colors.red = index === 0 ? Color.red : Color.randomRed();
    }

    if (this.dc === 0) {
      return [this.colors.blue];
    }

    if (this.hasDamage()) {
      for (let key = 0; key <= this.damage.max(); key++) {
        if (key === 0) {
          barColors.push(this.colors.red);
        } else {
          barColors.push(this.colors.blue);
        }
      }
      return barColors;
    }

    for (let key = this.normal.min(); key <= this.normal.max(); key++) {
      if (this.rpgSystem === "dnd") {
        barColors.push(this.dndColor(key));
      } else if (this.rpgSystem === "coc") {
        barColors.push(this.cocColors(key));
      } else {
        barColors.push(this.gurpsColor(key));
      }
    }

    return barColors;
  }

  public dndColor(key: number): string {
    if (this.rpgDefault()) {
      if (key < this.dc) {
        return this.colors.red;
      } else if (key < (!this.xCrit ? 20 : 19)) {
        return this.colors.blue;
      } else {
        return this.colors.green;
      }
    } else {
      if (key < this.dc) {
        return this.colors.red;
      } else {
        return this.colors.blue;
      }
    }
  }

  public cocColors(key: number): string {
    if (this.rpgDefault()) {
      if (key <= this.dc / 5) {
        return this.colors.green;
      } else if (key <= this.dc / 2) {
        return this.colors.blue;
      } else if (key <= this.dc) {
        return this.colors.yellow;
      } else {
        return this.colors.red;
      }
    } else {
      if (key >= this.dc) {
        return this.colors.red;
      } else {
        return this.colors.blue;
      }
    }
  }

  public gurpsColor(key: number) {
    if (this.rpgDefault()) {
      if (key > this.dc || key >= 17) {
        return this.colors.red;
      } else if (key > this.dc - 10 && key > 4) {
        return this.colors.blue;
      } else {
        return this.colors.green;
      }
    } else {
      if (key >= this.dc) {
        return this.colors.red;
      } else {
        return this.colors.blue;
      }
    }
  }

  public setExtended(extended: boolean) {
    this.extended = extended;
  }

  public hasDamage() {
    return this.extended;
  }

  public hasCritical() {
    return this.critical.sum() !== 0;
  }

  /**
   * @returns Success probability
   */
  private successProbability(): number {
    let successChances: number = 0;

    //Check if key is a success, depending on the system
    this.normal.getKeys().forEach((key: number) => {
      if (this.rpgSystem === "gurps") {
        if ((this.dc >= key && key < 17) || key < 4) {
          successChances += this.normal.get(key);
        }
      } else if (this.rpgSystem === "coc") {
        if (this.dc >= key) {
          successChances += this.normal.get(key);
        }
      } else {
        if (this.dc <= key) {
          successChances += this.normal.get(key);
        }
      }
    });

    //Success probability
    return successChances / this.normal.sum();
  }

  public criticalProbability(): number {
    let crit: number = 0;
    if (this.rpgSystem === "dnd") {
      crit = this.normal.get(20);
      if (this.xCrit) {
        crit += this.normal.get(19);
      }
    } else if (this.rpgSystem === "coc") {
      this.normal.getKeys().forEach((key: number) => {
        if (key <= this.dc / 5) {
          crit += this.normal.get(key);
        }
      });
    } else {
      this.normal.getKeys().forEach((key: number) => {
        if (key <= this.dc - 10 || key <= 4) {
          crit += this.normal.get(key);
        }
      });
    }
    crit *= 1 / this.normal.sum();

    return crit;
  }

  public rpgDefault(): boolean {
    return (
      this.formsData.dices === "" ||
      (this.formsData.dices === "3d6" && this.rpgSystem === "gurps") ||
      (this.formsData.dices.includes("d100") && this.rpgSystem === "coc") ||
      (this.formsData.dices.includes("d20") && this.rpgSystem === "dnd")
    );
  }

  public legend() {
    let percentage: string[] = [];
    const success = this.successProbability();
    const critical = this.criticalProbability();
    const average = this.average();
    percentage.push(average);

    if (this.dc === 0) {
      percentage.push("100%");
      return percentage;
    }

    if (this.rpgSystem !== "coc" && this.rpgDefault()) {
      percentage.push(String(Utils.twoDecimals((1 - success) * 100)) + "%");
      percentage.push(String(Utils.twoDecimals(success * 100)) + "%");
      percentage.push(String(Utils.twoDecimals(critical * 100)) + "%");
      return percentage;
    }

    if (!this.rpgDefault()) {
      percentage.push(String(Utils.twoDecimals((1 - success) * 100)) + "%");
      percentage.push(String(Utils.twoDecimals(success * 100)) + "%");
      return percentage;
    }

    let red = 0;
    let yellow = 0;
    let blue = 0;
    let green = 0;

    this.normal.getKeys().forEach((key: number) => {
      if (key <= this.dc / 5) {
        green += this.normal.get(key);
      }
      if (key <= this.dc / 2) {
        blue += this.normal.get(key);
      }
      if (key <= this.dc) {
        yellow += this.normal.get(key);
      }
      if (key > this.dc) {
        red += this.normal.get(key);
      }
    });

    percentage.push(
      String(Utils.twoDecimals((red / this.normal.sum()) * 100)) + "%"
    );
    percentage.push(
      String(Utils.twoDecimals((yellow / this.normal.sum()) * 100)) + "%"
    );
    percentage.push(
      String(Utils.twoDecimals((blue / this.normal.sum()) * 100)) + "%"
    );
    percentage.push(
      String(Utils.twoDecimals((green / this.normal.sum()) * 100)) + "%"
    );
    return percentage;
  }

  average(): string {
    let average = 0;
    let total = 0;
    if (!this.hasDamage()) {
      this.normal.getKeys().forEach((key: number) => {
        average += key * this.normal.get(key);
      });
      average *= 1 / this.normal.sum();
      return String(Utils.twoDecimals(average));
    }

    this.damage.getKeys().forEach((key: number) => {
      average += key * this.damage.get(key);
    });

    total = this.damage.sum();

    if (this.hasCritical()) {
      this.critical.getKeys().forEach((key: number) => {
        average += key * this.critical.get(key);
      });
      total += this.critical.sum();
    }

    average *= 1 / total;
    return String(Utils.twoDecimals(average));
  }
}
