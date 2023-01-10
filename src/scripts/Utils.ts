export default class Utils {
  public static permutation(n: number, p: number) {
    return Utils.fatorial(n) / (Utils.fatorial(p) * Utils.fatorial(n - p));
  }

  public static fatorial(num: number) {
    var result = 1;
    for (var i = 2; i <= num; i++) result *= i;
    return result;
  }

  public static twoDecimals(num: number) {
    return Math.round(num * 100) / 100;
  }

  public static bonus(expression: string) {
    expression = expression.replace(/(-)/g, "+-");
    let sum = expression.split("+");
    return sum.reduce((a, b) => Number(a) + Number(b), 0);
  }
}
