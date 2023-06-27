// @ts-ignore
import Chances from "../types/Chances.ts";
// @ts-ignore
import Utils from "../Utils.ts";
// @ts-ignore
import System from "./System.ts";
// @ts-ignore
import Dice from "../Dice.ts";

export default class Vampire extends System {
    public dice = "1d10";

    public defaultDice(nDice: string, sides: string): string[] {
        if (nDice === "0" || nDice === "") {
            nDice = "1";
        }
        if (sides === "0" || sides === "") {
            sides = "10";
        }
        return [nDice, sides];
    }

    public rpgDefault(dices: string): boolean {
        if (!dices.includes(">") && !dices.includes("<")) {
            if (dices.split("d")[0] !== "" && dices.split("d")[0] !== "1") {
                super.setIsDefault(false);
                return super.getIsDefault();
            }
        }
        super.setIsDefault(dices.includes("d100"));
        return super.getIsDefault();
    }

    public normalChance(separation: string) {
        let nDice: string;
        let sides: string;
        const splited = separation.split("d");
        nDice = splited[0];
        sides = splited[1];

        const check: string[] = this.defaultDice(nDice, sides);
        nDice = check[0];
        sides = check[1];

        if (sides === "10") {
            return Dice.chancesAbove(Number(nDice), Number(sides));
        }
        return Dice.chances(Number(nDice), Number(sides));
    }
}
