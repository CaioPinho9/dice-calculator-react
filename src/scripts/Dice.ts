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

  public static Probability(sideDice: number, nDice: number): Dictionary {
    var probability = new Dictionary();
    for (var key = nDice; key <= sideDice * nDice; key++) {
      probability.set(key, Utils.ExactSumProbability(key, nDice, sideDice));
    }
    return Utils.DecimalToChance(probability, sideDice ** nDice);
  }

  public static MergeDiceProbability(
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

  public getProbability(): Dictionary {
    return this.probability;
  }
  public getSide(): number {
    return this.sideDice;
  }
  public getNDice(): number {
    return this.nDice;
  }
  public setProbability(probability: Dictionary) {
    this.probability = probability;
  }
}
