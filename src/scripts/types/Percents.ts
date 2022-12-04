// @ts-ignore
import Chances from "./Chances.ts";
// @ts-ignore
import Decimals from "./Decimals.ts";
// @ts-ignore
import Dictionary from "./Dictionary.ts";

export default class Percents extends Dictionary {
  //Convert a dictionary of percent values into an dictionary of chances
  toChance(totalChances: number) {
    var chances = new Chances();
    super.getKeys().forEach((key: number) => {
      const value = super.get(key);
      chances.set(key, parseFloat(((value * totalChances) / 100).toFixed(2)));
    });
    return chances;
  }

  //Convert a dictionary of percent values into an dictionary of decimals
  toDecimal() {
    var decimals = new Decimals();
    super.getKeys().forEach((key: number) => {
      const value = super.get(key);
      decimals.set(key, parseFloat((value / 100).toFixed(2)));
    });
    return decimals;
  }
}
