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
  public half: Chances;
  public critical: Chances;
  public xCrit: boolean;
  public rpgSystem: any;
  public formsData: any;
  public colors: {
    red: string;
    yellow: string;
    blue: string;
    green: string;
  };

  constructor(dc: number, rpgSystem: any, formsData: any, extended: boolean) {
    this.normal = new Chances();
    this.damage = new Chances();
    this.half = new Chances();
    this.critical = new Chances();
    this.colors = { red: "", yellow: "", green: "", blue: "" };
    this.xCrit = false;
    this.dc = dc;
    this.rpgSystem = rpgSystem;
    this.formsData = formsData;
    this.extended = extended;
    rpgSystem.rpgDefault(formsData.dices);
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
      return datasets;
    }

    datasets.push({
      label: "Damage",
      backgroundColor: this.getBarColors(index),
      borderColor: this.getBarColors(index),
      borderRadius: 20,
      minBarThickness: 30,
      maxBarThickness: 100,
      data: this.damage
        .toPercent(this.critical.sum() + this.half.sum())
        .toArray(),
      stack: "Stack " + index,
    });

    if (this.hasHalf()) {
      datasets.push({
        label: "Half Damage",
        backgroundColor: this.getBarColors(index, true),
        borderColor: this.getBarColors(index, true),
        borderRadius: 20,
        minBarThickness: 30,
        maxBarThickness: 100,
        data: this.half
          .toPercent(this.critical.sum() + this.damage.sum())
          .toArray(),
        stack: "Stack " + index,
      });
    }

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
      data: this.critical
        .toPercent(this.damage.sum() + this.half.sum())
        .toArray(),
      stack: "Stack " + index,
    });

    return datasets;
  }

  private getBarColors(index: number): string[];
  private getBarColors(index: number, half: boolean): string[];
  private getBarColors(index: number): string[] {
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

    if (this.hasHalf()) {
      if (arguments[1]) {
        barColors.push(this.colors.red);
      } else {
        barColors.push(this.colors.blue);
      }
      return barColors;
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
      barColors.push(
        this.rpgSystem.color(key, this.dc, this.colors, this.xCrit)
      );
    }

    return barColors;
  }

  public hasDamage() {
    return this.extended;
  }

  public hasHalf() {
    return this.half.sum() !== 0;
  }

  public hasCritical() {
    return this.critical.sum() !== 0;
  }

  /**
   * @returns Success probability
   */
  private successProbability(): number {
    let successChances: number = 0;

    //Check if key is a success, depending on the rpgSystem
    this.normal.getKeys().forEach((key: number) => {
      successChances += this.rpgSystem.success(
        key,
        this.dc,
        this.normal.get(key)
      );
    });

    //Success probability
    return successChances / this.normal.sum();
  }

  public criticalProbability(): number {
    let crit: number = this.rpgSystem.critical(
      this.dc,
      this.normal,
      this.xCrit
    );

    crit *= 1 / this.normal.sum();

    return crit;
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

    percentage.push(
      ...this.rpgSystem.legend(success, critical, this.normal, this.dc)
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

    if (this.hasHalf()) {
      this.half.getKeys().forEach((key: number) => {
        average += key * this.half.get(key);
      });
      total += this.half.sum();
    }

    average *= 1 / total;
    return String(Utils.twoDecimals(average));
  }
}
