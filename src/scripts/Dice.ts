// @ts-ignore
import Dictionary from "./Dictionary.ts";
// @ts-ignore
import Utils from "./Utils.ts";

export default class Dice {
  private chances: Dictionary;
  private sideDice: number;
  private nDice: number;

  constructor(nDice: number, sideDice: number) {
    this.nDice = nDice;
    this.sideDice = sideDice;
    this.chances = Dice.Chances(nDice, sideDice);
  }

  //Basic probability calculation for n s-dice
  public static Chances(nDice: number, sideDice: number): Dictionary {
    var percent = new Dictionary();
    for (var key = nDice; key <= sideDice * nDice; key++) {
      percent.set(key, Utils.ExactSumProbability(key, nDice, sideDice));
    }
    return Utils.DecimalToChance(percent, sideDice ** nDice);
  }

  //Recalculate probability if number is lower than "reroll"
  public static ChancesRerollOne(
    nDice: number,
    sideDice: number,
    reroll: number
  ): Dictionary {
    var chances = new Dictionary();
    for (var n = 1; n <= nDice; n++) {
      var chancesRerolled = new Dictionary();
      for (var key = 1; key <= sideDice; key++) {
        var chancesReroll = new Dictionary();
        chancesReroll.set(key, 1);
        if (key <= reroll) {
          chancesReroll = Dice.Chances(1, sideDice);
        }
        if (chancesRerolled.size() === 0) {
          chancesRerolled = chancesReroll;
        } else {
          chancesRerolled = Dice.SumChances(
            chancesRerolled,
            chancesReroll,
            true
          );
        }
      }
      if (chances.size() === 0) {
        chances = chancesRerolled;
      } else {
        chances = Dice.MergeChances(chances, chancesRerolled, true);
      }
    }
    return chances;
  }

  //Unify two probabilities curves
  public static MergeChances(
    chances1: Dictionary,
    chances2: Dictionary,
    //Sum = true, minus = false
    sum: boolean
  ): Dictionary {
    var chances = new Dictionary();

    chances1.getKeys().forEach((key1: number) => {
      chances2.getKeys().forEach((key2: number) => {
        chances.add(
          key1 + key2 * (sum ? 1 : -1),
          chances1.get(key1) * chances2.get(key2)
        );
      });
    });
    return chances;
  }

  //Unify two probabilities curves
  public static SumChances(
    chances1: Dictionary,
    chances2: Dictionary,
    //Sum = true, minus = false
    sum: boolean
  ): Dictionary {
    var chances = new Dictionary();

    chances1.getKeys().forEach((key1: number) => {
      chances.add(key1, chances1.get(key1));
    });
    chances2.getKeys().forEach((key2: number) => {
      chances.add(key2, chances2.get(key2) * (sum ? 1 : -1));
    });
    return chances;
  }

  //Move the probability curve horizontally
  public static DeslocateProbability(
    probOld: Dictionary,
    value: number
  ): Dictionary {
    var probNew = new Dictionary();

    probOld.getKeys().forEach((key: number) => {
      probNew.add(key + value, probOld.get(key));
    });
    return probNew;
  }

  public getChances(): Dictionary {
    return this.chances;
  }
  public getSide(): number {
    return this.sideDice;
  }
  public getNDice(): number {
    return this.nDice;
  }
}
