// @ts-ignore
import Chances from "./types/Chances.ts";

export default class Test {
  public dc: number;
  public extended: boolean;
  public normal: Chances;
  public damage: Chances;
  public critical: Chances;

  constructor() {
    this.normal = new Chances();
    this.damage = new Chances();
    this.critical = new Chances();
  }

  public static getDamageIndex(tests: Test[]) {
    let result = -1;
    tests.forEach((test, index) => {
      if (test.extended) {
        result = index;
      }
    });
    return result;
  }
}
