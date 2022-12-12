// @ts-ignore
import Dice from "../Dice.ts";
// @ts-ignore
import Chances from "../types/Chances.ts";

export default abstract class System {
  private isDefault: boolean = false;

  public getIsDefault(): boolean {
    return this.isDefault;
  }

  public setIsDefault(isDefault: boolean) {
    this.isDefault = isDefault;
  }

  public dcBonus(dc: string): number {
    return Number(dc);
  }

  public addBonus(chances: Chances, bonus: string): Chances {
    if (bonus !== "") {
      chances = Dice.deslocateProbability(chances, Number(bonus));
    }
    return chances;
  }

  public advantage(separation: string): string {
    return separation;
  }

  public defaultDice(nDice: number, sides: number) {}

  public rpgDefault(dices: string): boolean {
    this.isDefault = dices === "";
    return this.isDefault;
  }

  public color(key: number, dc: number, colors: any): string {
    return colors.red;
  }

  public success(key: number, dc: number, chances: number) {}

  public critical(dc: number, chances: number, xCrit) {}

  public legend(success: number, critical: number) {}

  public graphText(dc: string, bonus: string) {
    let text = "";
    if (bonus !== "") {
      text += " + " + bonus;
    }

    if (dc !== "0") {
      text += " DC" + dc;
    }
    return text;
  }

  public reverse(hasDamage: boolean) {}
}
