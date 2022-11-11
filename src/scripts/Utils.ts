// @ts-ignore
import Dictionary from "./Dictionary.ts";

export default class Utils {

  public static ExactSumProbability(sum: number, nDices: number, sideDice: number): number {
    var somatory = 0;
    for (var i = 0; i <= Math.floor((sum-nDices)/sideDice); i++) {
      somatory += (-1)**i * this.Permutation(nDices, i) * this.Permutation(sum - sideDice*i - 1, nDices-1);
    }
    return 1/sideDice**nDices * somatory;
  }

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

  //Convert a dictionary of decimal values into an dictionary of chances
  public static DecimalToChance(decimals:Dictionary, totalChances:number) {
    var chances = new Dictionary();
    decimals.getKeys().forEach((key: number) => {
      const value = decimals.get(Number(key))
      chances.add(Number(key), parseFloat((value * totalChances).toFixed(2)))
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

  //Convert a dictionary of chances into an dictionary of decimal values
  public static ChanceToDecimal(chances:Dictionary) {
    var decimals = new Dictionary();
    let totalChances = chances.sum();
    chances.getKeys().forEach((key: number) => {
      const value = chances.get(Number(key))
      decimals.add(Number(key), parseFloat((value / totalChances).toFixed(2)))
    })
    return decimals
  }
}