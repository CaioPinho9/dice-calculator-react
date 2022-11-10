class Utils {

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

  //Convert a array of percent values into an array of chances
  public static PercentToChance(array:Array<number>) {
    return array.map(function(x) { return x * array.reduce((a, b) => a + b, 0) });
  }

  //Convert a array of chances into an array of percent values
  public static ChanceToPercent(array:Array<number>) {
    return array.map(function(x) { 
      return parseFloat(((x / array.reduce((a, b) => a + b, 0)) * 100).toFixed(2))
    })
  }
}