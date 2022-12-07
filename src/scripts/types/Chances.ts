// @ts-ignore
import Decimals from "./Decimals.ts";
// @ts-ignore
import Dictionary from "./Dictionary.ts";
// @ts-ignore
import Percents from "./Percents.ts";

export default class Chances extends Dictionary {
  //Convert a dictionary of chances into an dictionary of percent values

  public toPercent(): Percents;
  public toPercent(expandedChances: Chances): Percents;
  public toPercent(): Percents {
    var percents = new Percents();
    let totalChances = super.sum();
    if (arguments.length > 0) {
      totalChances += arguments[0].sum();
    }
    super.getKeys().forEach((key: number) => {
      const value = super.get(key);
      percents.set(key, Math.round((value / totalChances) * 10000) / 100);
    });
    return percents;
  }

  sum() {
    return super.sum();
  }

  //Convert a dictionary of chances into an dictionary of decimal values
  toDecimal(): Decimals {
    var decimals = new Decimals();
    let totalChances = super.sum();
    super.getKeys().forEach((key: number) => {
      const value = super.get(key);
      decimals.set(key, Math.round((value / totalChances) * 100) / 100);
    });
    return decimals;
  }
}
