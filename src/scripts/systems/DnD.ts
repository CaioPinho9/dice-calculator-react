// @ts-ignore
import Chances from "../types/Chances.ts";
// @ts-ignore
import Utils from "../Utils.ts";
// @ts-ignore
import System from "./System.ts";

export default class DnD extends System {
  public dice = "1d20";

  public defaultDice(nDice: string, sides: string): string[] {
    if (nDice === "0" || nDice === "") {
      nDice = "1";
    }
    if (sides === "0" || sides === "") {
      sides = "20";
    }
    return [nDice, sides];
  }

  public rpgDefault(dices: string): boolean {
    if (!dices.includes(">") && !dices.includes("<")) {
      if (dices.split("d")[0] !== "" && dices.split("d")[0] !== "1") {
        super.setIsDefault(false);
        return super.getIsDefault();
      }
    }
    super.setIsDefault(dices.includes("d20"));
    return super.getIsDefault();
  }

  public color(
    key: number,
    dc: number,
    colors: any,
    xCrit: boolean,
    bonus: number
  ): string {
    if (super.getIsDefault()) {
      if (key < dc) {
        return colors.red;
      } else if (key < (!xCrit ? 20 + bonus : 19 + bonus)) {
        return colors.blue;
      } else {
        return colors.green;
      }
    } else {
      if (key < dc) {
        return colors.red;
      } else {
        return colors.blue;
      }
    }
  }

  public success(key: number, dc: number, chances: number) {
    if (dc <= key) {
      return chances;
    } else {
      return 0;
    }
  }

  public critical(dc: number, normal: Chances, xCrit: boolean, bonus: number) {
    let crit = normal.get(20 + bonus);
    if (xCrit) {
      crit += normal.get(19 + bonus);
    }
    return crit;
  }

  public legend(success: number, critical: number) {
    let percentage: string[] = [];
    if (super.getIsDefault()) {
      percentage.push(String(Utils.twoDecimals((1 - success) * 100)) + "%");
      percentage.push(String(Utils.twoDecimals(success * 100)) + "%");
      percentage.push(String(Utils.twoDecimals(critical * 100)) + "%");
    } else {
      percentage.push(String(Utils.twoDecimals((1 - success) * 100)) + "%");
      percentage.push(String(Utils.twoDecimals(success * 100)) + "%");
    }
    return percentage;
  }

  public reverse() {
    return false;
  }
}
