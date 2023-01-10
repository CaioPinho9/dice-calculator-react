// @ts-ignore
import Chances from "../types/Chances.ts";
// @ts-ignore
import Utils from "../Utils.ts";
// @ts-ignore
import System from "./System.ts";

export default class CoC extends System {
  public dice = "1d100";

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
      nDice = "1";
    }
    if (sides === "0" || sides === "") {
      sides = "100";
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
    super.setIsDefault(dices.includes("d100"));
    return super.getIsDefault();
  }

  public color(key: number, dc: number, colors: any): string {
    if (super.getIsDefault()) {
      if (key <= dc / 5) {
        return colors.green;
      } else if (key <= dc / 2) {
        return colors.blue;
      } else if (key <= dc) {
        return colors.yellow;
      } else {
        return colors.red;
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
    if (dc >= key) {
      return chances;
    } else {
      return 0;
    }
  }

  public critical(dc: number, normal: Chances) {
    let crit: number = 0;
    normal.getKeys().forEach((key: number) => {
      if (key <= dc / 5) {
        crit += normal.get(key);
      }
    });
    return crit;
  }

  public legend(
    success: number,
    critical: number,
    normal: Chances,
    dc: number
  ) {
    let percentage: string[] = [];
    if (super.getIsDefault()) {
      let red = 0;
      let yellow = 0;
      let blue = 0;
      let green = 0;

      normal.getKeys().forEach((key: number) => {
        if (key <= dc / 5) {
          green += normal.get(key);
        }
        if (key <= dc / 2) {
          blue += normal.get(key);
        }
        if (key <= dc) {
          yellow += normal.get(key);
        }
        if (key > dc) {
          red += normal.get(key);
        }
      });

      percentage.push(
        String(Utils.twoDecimals((red / normal.sum()) * 100)) + "%"
      );
      percentage.push(
        String(Utils.twoDecimals((yellow / normal.sum()) * 100)) + "%"
      );
      percentage.push(
        String(Utils.twoDecimals((blue / normal.sum()) * 100)) + "%"
      );
      percentage.push(
        String(Utils.twoDecimals((green / normal.sum()) * 100)) + "%"
      );
    } else {
      percentage.push(String(Utils.twoDecimals((1 - success) * 100)) + "%");
      percentage.push(String(Utils.twoDecimals(success * 100)) + "%");
    }
    return percentage;
  }

  public reverse(hasDamage: boolean) {
    return super.getIsDefault() && !hasDamage;
  }
}
