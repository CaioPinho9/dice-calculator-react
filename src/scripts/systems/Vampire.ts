// @ts-ignore
import Chances from "../types/Chances.ts";
// @ts-ignore
import Utils from "../Utils.ts";
// @ts-ignore
import System from "./System.ts";
// @ts-ignore
import Dice from "../Dice.ts";
import {c} from "chart.js/dist/chunks/helpers.core";

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
        super.setIsDefault(dices.includes("d10") && !dices.includes("d100"));
        return super.getIsDefault();
    }

    public normalChance(nDice: number, sides: number, critico: boolean) {
        if (sides === 10) {
            return Dice.chancesVampire(nDice, sides, critico);
        }
        return Dice.chances(nDice, sides);
    }

    public bestial(nDice: number, hungerDices: number, dc: number) {
        let bestialSuccess = 0;
        let bestialFailure = 0;
        for (let hunger = 1; hunger <= hungerDices; hunger++) {
            for (let success = dc; success <= nDice; success++) {
                if (success > 1) {
                    for (let critical = 2; critical <= success; critical++) {
                        bestialSuccess += (1 / 10) ** hunger * ((1 / 10) ** (critical - hunger)) *
                            (4 / 10) ** (success - critical) * (5 / 10) ** (nDice - success) *
                            Utils.permutation(nDice, success)
                    }
                }
            }

            bestialFailure += (1 / 10) ** hunger * (5 / 10) ** (nDice - hunger) * Utils.permutation(nDice, hunger)
        }
        return [bestialSuccess, bestialFailure]
    }

    public color(
        key: number,
        dc: number,
        colors: any,
        xCrit: boolean,
        bonus: number
    ): string {
        if (key < dc) {
            return colors.red;
        } else {
            return colors.blue;
        }
    }

    public success(key: number, dc: number, chances: number) {
        if (dc <= key) {
            return chances;
        } else {
            return 0;
        }
    }

    public legend(success: number, critical: number) {
        let percentage: string[] = [];
        percentage.push(String(Utils.twoDecimals((1 - success) * 100)) + "%");
        percentage.push(String(Utils.twoDecimals(success * 100)) + "%");
        return percentage;
    }
}
