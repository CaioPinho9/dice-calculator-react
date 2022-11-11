// @ts-ignore
import Dictionary from "./Dictionary.ts";
// @ts-ignore
import Utils from "./Utils.ts";

export default class Dice {
  
  private probability: Dictionary
  private sideDice:number
  private nDice:number

  constructor(nDice:number, sideDice:number) {
    this.nDice = nDice
    this.sideDice = sideDice
    this.probability = Dice.Probability(sideDice, nDice)
  }

  public static Probability(sideDice:number, nDice:number): Dictionary {
    var probability = new Dictionary()
    for (var key = nDice; key <= sideDice*nDice; key++) {
      probability.add(key, Utils.ExactSumProbability(key, nDice, sideDice) * 100)
    }
    return probability;
  }

  public getProbability(): Dictionary {
    return this.probability
  }
  public getSide(): number {
    return this.sideDice
  }
  public getNDice(): number {
    return this.nDice
  }
  public setProbability(probability: Dictionary) {
    this.probability = probability
  }
}