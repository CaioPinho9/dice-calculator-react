// @ts-ignore
import Decimals from "./Decimals.ts";
// @ts-ignore
import Dictionary from "./Dictionary.ts";
// @ts-ignore
import Percents from "./Percents.ts";

export default class Chances extends Dictionary {
  //Convert a dictionary of chances into an dictionary of percent values
  toPercent(): Percents {
    var percents = new Percents();
    let totalChances = super.sum();
    super.getKeys().forEach((key: number) => {
      const value = super.get(key);
      percents.set(key, parseFloat(((value / totalChances) * 100).toFixed(2)));
    });
    return percents;
  }

  //Convert a dictionary of chances into an dictionary of decimal values
  toDecimal(): Decimals {
    var decimals = new Decimals();
    let totalChances = super.sum();
    super.getKeys().forEach((key: number) => {
      const value = super.get(key);
      decimals.set(key, parseFloat((value / totalChances).toFixed(2)));
    });
    return decimals;
  }
}
