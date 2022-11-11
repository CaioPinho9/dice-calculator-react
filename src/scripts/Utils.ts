// @ts-ignore
import Dictionary from "./Dictionary.ts";

export default class Utils {

  public static Permutation(n:number, p:number) {
    return Utils.Fatorial(n)/(Utils.Fatorial(p)*(Utils.Fatorial(n-p)))
  }

  public static Fatorial(num:number)
  {
    var result = 1;
    for (var i = 2; i <= num; i++)
        result = result * i;
    return result;
  }

  //Convert a dictionary of percent values into an dictionary of chances
  public static PercentToChance(percents:Dictionary, totalChances:number) {
    var chances = new Dictionary();
    percents.getKeys().forEach((key: number) => {
      const value = percents.get(Number(key))
      chances.add(Number(key), parseFloat(((value * totalChances) / 100).toFixed(2)))
    })
    return chances
  }

  //Convert a dictionary of chances into an dictionary of percent values
  public static ChanceToPercent(chances:Dictionary) {
    var percents = new Dictionary();
    let totalChances = chances.sum();
    chances.getKeys().forEach((key: number) => {
      const value = chances.get(Number(key))
      percents.add(Number(key), parseFloat(((value / totalChances) * 100).toFixed(2)))
    })
    return percents
  }
}