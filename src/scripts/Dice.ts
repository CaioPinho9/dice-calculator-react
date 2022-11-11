// @ts-ignore
import Dictionary from "./Dictionary.ts";
// @ts-ignore
import Utils from "./Utils.ts";

export default class Dice {
  private probability: Dictionary;
  private sideDice: number;
  private nDice: number;

  constructor(nDice: number, sideDice: number) {
    this.nDice = nDice;
    this.sideDice = sideDice;
    this.probability = Dice.Probability(sideDice, nDice);
  }

  //Basic probability calculation for n s-dice
  public static Probability(sideDice: number, nDice: number): Dictionary {
    var probability = new Dictionary();
    for (var key = nDice; key <= sideDice * nDice; key++) {
      probability.set(key, Utils.ExactSumProbability(key, nDice, sideDice));
    }
    return Utils.DecimalToChance(probability, sideDice ** nDice);
  }

  //Unify two probabilities curves
  public static MergeProbability(
    probability1: Dictionary,
    probability2: Dictionary,
    //Sum = true, minus = false
    sum: boolean
  ): Dictionary {
    var probability = new Dictionary();

    probability1.getKeys().forEach((key1: number) => {
      probability2.getKeys().forEach((key2: number) => {
        probability.add(
          key1 + key2 * (sum ? 1 : -1),
          probability1.get(key1) * probability2.get(key2)
        );
      });
    });
    return probability;
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

  public getProbability(): Dictionary {
    return this.probability;
  }
  public getSide(): number {
    return this.sideDice;
  }
  public getNDice(): number {
    return this.nDice;
  }
}
