export default class Utils {
  public static permutation(n: number, p: number) {
    return Utils.fatorial(n) / (Utils.fatorial(p) * Utils.fatorial(n - p));
  }

  public static fatorial(num: number) {
    var result = 1;
    for (var i = 2; i <= num; i++) result = result * i;
    return result;
  }
}
