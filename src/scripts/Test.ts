// @ts-ignore
import Chances from "./types/Chances.ts";
// @ts-ignore
import Color from "./Color.ts";

export default class Test {
  private extended: boolean;
  public dc: number;
  public normal: Chances;
  public damage: Chances;
  public critical: Chances;
  public rpgSystem: string;
  public formsData: any;

  constructor() {
    this.normal = new Chances();
    this.damage = new Chances();
    this.critical = new Chances();
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
        backgroundColor: this.backgroundColors(index),
        borderColor: this.backgroundColors(index),
        borderRadius: 5,
        minBarThickness: 30,
        maxBarThickness: 100,
        data: this.normal.toPercent().toArray(),
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
        data: this.damage.toPercent(this.critical).toArray(),
        stack: "Stack " + index,
      });

      if (!this.hasCritical()) {
        return datasets;
      }

      datasets.push({
        label: "Critical",
        backgroundColor: index === 0 ? Color.green : Color.randomGreen(),
        borderColor: index === 0 ? Color.green : Color.randomGreen(),
        borderRadius: 5,
        minBarThickness: 30,
        maxBarThickness: 100,
        data: this.critical.toPercent(this.damage).toArray(),
        stack: "Stack " + index,
      });
    }
    return datasets;
  }

  private backgroundColors(index: number) {
    let colors: string[] = [];
    const green: string = index === 0 ? Color.green : Color.randomGreen();
    const blue: string = index === 0 ? Color.blue : Color.randomBlue();
    const yellow: string = index === 0 ? Color.yellow : Color.randomYellow();
    const red: string = index === 0 ? Color.red : Color.randomRed();

    if (this.dc === 0) {
      return [blue];
    }

    if (this.hasDamage()) {
      for (let key = 0; key <= this.damage.max(); key++) {
        if (key === 0) {
          colors.push(red);
        } else {
          colors.push(blue);
        }
      }
      return colors;
    }

    for (let key = this.normal.min(); key <= this.normal.max(); key++) {
      if (this.rpgSystem === "dnd") {
        colors.push(this.dndColor(key, green, blue, red));
      } else if (this.rpgSystem === "coc") {
        colors.push(this.cocColors(key, green, blue, yellow, red));
      } else {
        colors.push(this.gurpsColor(key, green, blue, red));
      }
    }

    return colors;
  }

  public dndColor(
    key: number,
    green: string,
    blue: string,
    red: string
  ): string {
    if (this.rpgDefault()) {
      if (key < this.dc) {
        return red;
      } else if (key < 20) {
        return blue;
      } else {
        return green;
      }
    } else {
      if (key < this.dc) {
        return red;
      } else {
        return blue;
      }
    }
  }

  public cocColors(
    key: number,
    green: string,
    blue: string,
    yellow: string,
    red: string
  ): string {
    if (this.rpgDefault()) {
      if (key <= this.dc / 5) {
        return green;
      } else if (key <= this.dc / 2) {
        return blue;
      } else if (key <= this.dc) {
        return yellow;
      } else {
        return red;
      }
    } else {
      if (key >= this.dc) {
        return red;
      } else {
        return blue;
      }
    }
  }

  public gurpsColor(key: number, green: string, blue: string, red: string) {
    if (this.rpgDefault()) {
      if (key > this.dc || key >= 17) {
        return red;
      } else if (key > this.dc - 10 && key > 4) {
        return blue;
      } else {
        return green;
      }
    } else {
      if (key >= this.dc) {
        return red;
      } else {
        return blue;
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
      if (this.rpgSystem === "gurps" || this.rpgSystem === "coc") {
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
      (this.formsData.dices === "1d100" && this.rpgSystem === "coc") ||
      (this.formsData.dices.includes("d20") && this.rpgSystem === "dnd")
    );
  }

  public legend() {
    let percentage: string[] = [];
    const success = this.successProbability();
    const critical = this.criticalProbability();

    if (this.dc === 0) {
      return ["100%"];
    }

    if (this.rpgSystem !== "coc" && this.rpgDefault()) {
      percentage.push(String(Math.round((1 - success) * 10000) / 100) + "%");
      percentage.push(String(Math.round(success * 10000) / 100) + "%");
      percentage.push(String(Math.round(critical * 10000) / 100) + "%");
      return percentage;
    }

    if (!this.rpgDefault()) {
      percentage.push(String(Math.round((1 - success) * 10000) / 100) + "%");
      percentage.push(String(Math.round(success * 10000) / 100) + "%");
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
      String(Math.round((red / this.normal.sum()) * 10000) / 100) + "%"
    );
    percentage.push(
      String(Math.round((yellow / this.normal.sum()) * 10000) / 100) + "%"
    );
    percentage.push(
      String(Math.round((blue / this.normal.sum()) * 10000) / 100) + "%"
    );
    percentage.push(
      String(Math.round((green / this.normal.sum()) * 10000) / 100) + "%"
    );
    return percentage;
  }
}
