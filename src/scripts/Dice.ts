// @ts-ignore
import Chances from "./types/Chances.ts";
// @ts-ignore
import Utils from "./Utils.ts";
// @ts-ignore
import Decimals from "./types/Decimals.ts";

export default class Dice {
  /**
   * Basic probability calculation for n s-dice
   */
  public static chances(nDice: number, sideDice: number): Chances {
    var decimal = new Decimals();
    for (var key = nDice; key <= sideDice * nDice; key++) {
      let normalizedKey = key;
      if (key > Math.floor((sideDice * nDice) / 2)) {
        normalizedKey = sideDice * nDice - key + Number(nDice);
      }

      decimal.set(
        key,
        this.exactSumProbability(normalizedKey, nDice, sideDice)
      );
    }
    return decimal.toChance(sideDice ** nDice);
  }

  /**
   * Recalculate probability if number is lower than "reroll"
   */
  public static chancesReroll(
    nDice: number,
    sideDice: number,
    reroll: number,
    rerollAlways: boolean
  ): Chances {
    var chances = new Chances();
    for (var n = 1; n <= nDice; n++) {
      var chancesRerolled = new Chances();
      for (var key = 1; key <= sideDice; key++) {
        var chancesReroll = new Chances();
        if (key <= reroll) {
          if (chancesReroll.size() === 0) {
            chancesReroll = Dice.chances(1, sideDice);
          } else {
            chancesReroll = Dice.sumChances(
              Dice.chances(1, sideDice),
              chancesReroll,
              true
            );
          }
          if (rerollAlways) {
            // eslint-disable-next-line
            chancesReroll.getKeys().forEach((key: number) => {
              if (key <= reroll) {
                chancesReroll.removeItem(key);
              }
            });
          }
        } else {
          chancesReroll.add(key, 1);
        }
        if (chancesRerolled.size() === 0) {
          chancesRerolled = chancesReroll;
        } else {
          chancesRerolled = Dice.sumChances(
            chancesRerolled,
            chancesReroll,
            true
          );
        }
      }
      if (chances.size() === 0) {
        chances = chancesRerolled;
      } else {
        chances = Dice.mergeChances(chances, chancesRerolled, true);
      }
    }
    return chances;
  }

  /**
   * Advantage and disadvantage
   */
  public static advantageChances(
    nDice: number,
    sideDice: number,
    advantage: boolean,
    nKeep: number,
    reRoll: boolean
  ): Chances {
    var advantageArray = new Array(nDice);
    var chancesArray = new Array(sideDice + 1);

    //[1,1,1,1]
    advantageArray.fill(1);

    var lastIndex = 0;

    for (var index = 0; index < advantageArray.length; ) {
      //Saves to add
      var sortArray = [...advantageArray];
      var resultArray: Array<number> = []
      if (advantage) {
        sortArray.sort((a, b) => b - a);
        resultArray = sortArray.slice(0, nKeep);
      } else {
        sortArray.sort((a, b) => b + a);
        resultArray = sortArray.slice(0, nKeep);
      }

      var value = resultArray.reduce((total, num) => total + num, 0);

      if (chancesArray[value] == null) {
        chancesArray[value] = 1;
      } else {
        chancesArray[value] += 1;
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
    var chancesDictionary = new Chances();
    chancesArray.forEach((value: number, key: number) => {
      chancesDictionary.set(key, value);
    });
    return chancesDictionary;
  }

  /**
   * Unify two probabilities curves
   */
  public static mergeChances(
    chances1: Chances,
    chances2: Chances,
    //Sum = true, minus = false
    sum: boolean
  ): Chances {
    var chances = new Chances();

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

  /**
   * Unify two probabilities curves
   */
  public static sumChances(
    chances1: Chances,
    chances2: Chances,
    //Sum = true, minus = false
    sum: boolean
  ): Chances {
    var chances = new Chances();

    chances1.getKeys().forEach((key1: number) => {
      chances.add(key1, chances1.get(key1));
    });
    chances2.getKeys().forEach((key2: number) => {
      chances.add(key2, chances2.get(key2) * (sum ? 1 : -1));
    });
    return chances;
  }

  /**
   * Move the probability curve horizontally
   */
  public static deslocateProbability(probOld: Chances, value: number): Chances {
    var probNew = new Chances();

    probOld.getKeys().forEach((key: number) => {
      probNew.add(key + value, probOld.get(key));
    });
    return probNew;
  }

  public static multiplyProbability(probOld: Chances, value: number): Chances {
    var probNew = new Chances();

    probOld.getKeys().forEach((key: number) => {
      probNew.add(Math.floor(key * value), probOld.get(key));
    });
    return probNew;
  }

  //Find the probability of one number in n s-dices
  public static exactSumProbability(
    sum: number,
    nDices: number,
    sideDice: number
  ): number {
    var somatory = 0;
    for (var i = 0; i <= Math.floor((sum - nDices) / sideDice); i++) {
      somatory +=
        (-1) ** i *
        Utils.permutation(nDices, i) *
        Utils.permutation(sum - sideDice * i - 1, nDices - 1);
    }
    return (1 / sideDice ** nDices) * somatory;
  }
}
