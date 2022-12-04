// @ts-ignore
import Chances from "./Chances.ts";
// @ts-ignore
import Dictionary from "./Dictionary.ts";
// @ts-ignore
import Percents from "./Percents.ts";

export default class Decimals extends Dictionary {
  //Convert a dictionary of decimal values into an dictionary of chances
  toChance(totalChances: number) {
    var chances = new Chances();
    super.getKeys().forEach((key: number) => {
      const value = super.get(key);
      chances.set(key, parseFloat((value * totalChances).toFixed(2)));
    });
    return chances;
  }

  //Convert a dictionary of decimal values into an dictionary of percents
  toPercent() {
    var percents = new Percents();
    super.getKeys().forEach((key: number) => {
      const value = super.get(key);
      percents.set(key, parseFloat((value * 100).toFixed(2)));
    });
    return percents;
  }
}
