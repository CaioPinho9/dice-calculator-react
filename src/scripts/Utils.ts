export default class Utils {
  public static permutation(n: number, p: number) {
    return Utils.fatorial(n) / (Utils.fatorial(p) * Utils.fatorial(n - p));
  }

  public static fatorial(num: number) {
    var result = 1;
    for (var i = 2; i <= num; i++) result = result * i;
    return result;
  }

  //Create a random rgb color
  public static randomColor(blue: boolean): string {
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
