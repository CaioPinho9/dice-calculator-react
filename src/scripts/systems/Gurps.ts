// @ts-ignore
import Chances from "../types/Chances.ts";
// @ts-ignore
import Utils from "../Utils.ts";
// @ts-ignore
import System from "./System.ts";

export default class Gurps extends System {
  public dcBonus(dc: string, bonus: string): number {
    return Number(dc) + Utils.bonus(bonus);
  }

  public addBonus(chances: Chances) {
    return chances;
  }

  public advantage(separation: string) {
    if (separation.includes(">")) {
      separation = separation.replace(">", "<");
    } else {
      separation = separation.replace("<", ">");
    }
    return separation;
  }

  public defaultDice(nDice: string, sides: string): string[] {
    if (nDice === "0" || nDice === "") {
      nDice = "3";
    }
    if (sides === "0" || sides === "") {
      sides = "6";
    }
    return [nDice, sides];
  }

  public rpgDefault(dices: string): boolean {
    super.setIsDefault(dices === "" || dices === "3d6");
    return super.getIsDefault();
  }

  public color(key: number, dc: number, colors: any) {
    if (super.getIsDefault()) {
      if (key > dc || key >= 17) {
        return colors.red;
      } else if (key > dc - 10 && key > 4) {
        return colors.blue;
      } else {
        return colors.green;
      }
    } else {
      if (key >= dc) {
        return colors.red;
      } else {
        return colors.blue;
      }
    }
  }

  public success(key: number, dc: number, chances: number) {
    if ((dc >= key && key < 17) || key < 4) {
      return chances;
    } else {
      return 0;
    }
  }

  public critical(dc: number, normal: Chances) {
    let crit: number = 0;
    normal.getKeys().forEach((key: number) => {
      if (key <= dc - 10 || key <= 4) {
        crit += normal.get(key);
      }
    });
    return crit;
  }

  public legend(success: number, critical: number) {
    let percentage: string[] = [];
    if (super.isDefault) {
      percentage.push(String(Utils.twoDecimals((1 - success) * 100)) + "%");
      percentage.push(String(Utils.twoDecimals(success * 100)) + "%");
      percentage.push(String(Utils.twoDecimals(critical * 100)) + "%");
    } else {
      percentage.push(String(Utils.twoDecimals((1 - success) * 100)) + "%");
      percentage.push(String(Utils.twoDecimals(success * 100)) + "%");
    }
    return percentage;
  }

  public graphText(dc: string, bonus: string) {
    let text = "";

    if (dc !== "0") {
      text += " NH" + String(Number(dc) + Utils.bonus(bonus));
    }
    return text;
  }

  public reverse(hasDamage: boolean) {
    return super.getIsDefault() && !hasDamage;
  }
}
