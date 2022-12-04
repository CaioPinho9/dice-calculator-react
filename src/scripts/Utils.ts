// @ts-ignore
import Chances from "./types/Chances.ts";
// @ts-ignore
import Dictionary from "./Dictionary.ts";

export default class Utils {
  public static Permutation(n: number, p: number) {
    return Utils.Fatorial(n) / (Utils.Fatorial(p) * Utils.Fatorial(n - p));
  }

  public static Fatorial(num: number) {
    var result = 1;
    for (var i = 2; i <= num; i++) result = result * i;
    return result;
  }

  //Create a random rgb color
  public static RandomColor(blue: boolean): string {
    let r: number, g: number, b: number;
    if (blue) {
      //Default blue color
      return `rgb(20, 152, 222)`;
    } else {
      r = Math.random() * 255;
      g = Math.random() * 255;
      b = Math.random() * 255;
    }
    return `rgb(${r},${g},${b})`;
  }
}
