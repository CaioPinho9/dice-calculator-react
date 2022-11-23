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
  public static ChancesReroll(
    nDice: number,
    sideDice: number,
    reroll: number,
    rerollAlways: boolean
  ): Dictionary {
    var chances = new Dictionary();
    for (var n = 1; n <= nDice; n++) {
      var chancesRerolled = new Dictionary();
      for (var key = 1; key <= sideDice; key++) {
        var chancesReroll = new Dictionary();
        chancesReroll.set(key, 1);
        if (key <= reroll) {
          chancesReroll = Dice.Chances(1, sideDice);
          if (rerollAlways) {
            // eslint-disable-next-line
            chancesReroll.getKeys().forEach((key: number) => {
              if (key <= reroll) {
                chancesReroll.removeItem(key);
              }
            });
          }
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

  public static AdvantageChances(
    nDice: number,
    sideDice: number,
    advantage: boolean,
    nKeep: number,
    reRoll: boolean
  ): Dictionary {
    var advantageArray = new Array(nDice);
    var chancesArray = new Array(sideDice + 1);

    //[1,1,1,1]
    advantageArray.fill(1);

    var lastIndex = 0;

    for (var index = 0; index < advantageArray.length; ) {
      //Saves to add
      var sortArray = [...advantageArray];
      var result: number = 0;
      for (var i = 0; i < nKeep; i++) {
        var value: number = sortArray.splice(0, 1)[0];
        for (var sortI = 0; sortI < sortArray.length; sortI++) {
          if (advantage) {
            if (value < sortArray[sortI]) {
              sortArray.push(value);
              value = sortArray.splice(sortI, 1)[0];
            }
          } else {
            if (value > sortArray[sortI]) {
              sortArray.push(value);
              value = sortArray.splice(sortI, 1)[0];
            }
          }
        }
        result += value;
      }
      if (chancesArray[result] == null) {
        chancesArray[result] = 1;
      } else {
        chancesArray[result] += 1;
      }

      //Checks all index
      for (var check = 0; check <= lastIndex; check++) {
        //When the array is completed, it breaks the loop Ex: 4d6 [6,6,6,6]
        if (advantageArray.reduce((a, b) => a + b, 0) === sideDice * nDice) {
          index = advantageArray.length;
          break;
        }

        if (index === lastIndex && advantageArray[lastIndex] >= sideDice) {
          index = 0;
          advantageArray[lastIndex] = 1;
          lastIndex++;
          advantageArray[lastIndex]++;
          break;
        }

        //When this array[index] is full it resets and increases the index
        if (advantageArray[index] === sideDice) {
          advantageArray[index] = 1;
          index += 1;

          //If it's not full the array increases
        } else {
          advantageArray[index]++;
          index = 0;
          break;
        }
      }
    }

    //Halfling reroll, afects very little in advantage
    if (reRoll) {
      if (advantage) {
        chancesArray[1] = 0;
      } else {
        chancesArray[1] = chancesArray[2] / 2;
      }
    }
    //Convert array to dictionary of chances
    var chancesDictionary = new Dictionary();
    chancesArray.forEach((value: number, key: number) => {
      chancesDictionary.set(key, value);
    });
    return chancesDictionary;
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
          chances1.get(key1) + chances2.get(key2)
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
