import Chart, {ChartItem} from "chart.js/auto";
// @ts-ignore
import Graph from "./Graph.ts";
// @ts-ignore
import Dice from "./Dice.ts";
// @ts-ignore
import Chances from "./types/Chances.ts";
// @ts-ignore
import Test from "./Test.ts";
// @ts-ignore
import DnD from "./systems/DnD.ts";
// @ts-ignore
import Gurps from "./systems/Gurps.ts";
// @ts-ignore
import CoC from "./systems/CoC.ts";
// @ts-ignore
import Vampire from "./systems/Vampire.ts";


export default class Controller {
    //Graph object
    public chart: Chart;
    public rpgSystem: any;
    public tests: Test[] = [];
    public legends: { value: string[]; colors: string[] }[] = [];

    public interpreter(formsData: any[], system: string) {
        //Refresh
        this.tests = [];
        this.legends = [];
        let criticalData: { chances: Chances; probability: number }[] = [];

        if (system === "dnd") {
            this.rpgSystem = new DnD();
        } else if (system === "gurps") {
            this.rpgSystem = new Gurps();
        } else if (system === "coc") {
            this.rpgSystem = new CoC();
        } else if (system === "vampire") {
            this.rpgSystem = new Vampire();
        }

        //Process each line from forms
        formsData.forEach((line) => {
            let dices: string;
            let damage: string;
            let critical: string;
            let bonus: string;
            let isHalf: boolean = false;
            //Format
            line.dices = line.dices.toLowerCase();
            line.dices = line.dices === "" ? this.rpgSystem.dice : line.dices;
            line.dices = line.dices.replace(/( )/g, "");
            line.dices = line.dices.replace(/(-)/g, "+-");
            dices = line.dices;
            damage = line.damage.toLowerCase();
            damage = damage.replace(/( )/g, "");
            damage = damage.replace(/(-)/g, "+-");
            critical = line.crit.toLowerCase();
            critical = critical.replace(/( )/g, "");
            critical = critical.replace(/(-)/g, "+-");
            bonus = line.bonus.replace(/( )/g, "");
            bonus = line.bonus.replace(/(-)/g, "+-");

            //Error when using wrong caracters
            if (
                (!dices.match(/([0-9d><r~])+/) && dices !== "") ||
                (!damage.match(/([0-9d><r~])+/) && damage !== "")
            ) {
                throw new Error("Invalid caracters");
            }

            let testIndex = this.tests.length;

            //DC used to change graph colors
            if (line.dc === "") {
                line.dc = "0";
            }

            let dc = this.rpgSystem.dcBonus(line.dc, line.bonus);

            this.tests.push(
                new Test(dc, this.rpgSystem, line, line.extended && damage !== "")
            );

            this.expressionChance(bonus, testIndex, false);

            if (damage.includes("half")) {
                damage = damage.replace("half", "");
                isHalf = true;
            }

            if (critical.includes("x")) {
                critical = critical.replace("x", "");
                this.tests[testIndex].xCrit = true;
            }

            //Main dice probability
            let expressionChance: Chances;
            try {
                expressionChance = this.expressionChance(dices, testIndex, false);
            } catch (error) {
            }

            //Add bonus
            expressionChance = this.rpgSystem.addBonus(
                expressionChance,
                this.tests[testIndex].bonus
            );

            this.tests[testIndex].normal = expressionChance;
            //Normal test
            if (!this.tests[testIndex].hasDamage()) {
                return;
            }

            //Damage test
            //Success probability
            const success = this.tests[testIndex].successProbability();
            //Damage chance
            let damageChance = this.expressionChance(damage, testIndex, true);

            //Chance of zero damage
            if (!isHalf) {
                damageChance.set(0, (damageChance.sum() * (1 - success)) / success);
            } else {
                this.tests[testIndex].half = damageChance.copy();
                this.tests[testIndex].half = Dice.multiplyProbability(
                    this.tests[testIndex].half,
                    1 / 2
                );
                this.tests[testIndex].half.multiply(
                    (damageChance.sum() * success) /
                    (1 - success) /
                    this.tests[testIndex].half.sum()
                );
            }

            //Merge the damage with resultDamage
            if (this.tests[testIndex].damage.size() === 0) {
                this.tests[testIndex].damage = damageChance;
            } else {
                this.tests[testIndex].damage = Dice.mergeChances(
                    this.tests[testIndex].damage,
                    damageChance,
                    true
                );
            }

            if (critical !== "") {
                criticalData.push({
                    chances: this.expressionChance(critical, testIndex, true),
                    probability: this.tests[testIndex].criticalProbability(),
                });
            }
        });

        criticalData.forEach((data) => {
            let damage: Chances = new Chances();
            let index = Test.getDamageIndex(this.tests);

            this.tests[index].damage.getKeys().forEach((key: number) => {
                if (key > 0) {
                    damage.set(key, this.tests[index].damage.get(key));
                }
            });

            data.chances = Dice.mergeChances(damage, data.chances, true);

            data.chances.multiply(
                (this.tests[index].damage.sum() * data.probability) /
                (1 - data.probability) /
                data.chances.sum()
            );

            let removeCritical = data.probability * this.tests[index].damage.sum();
            removeCritical *= -1 / (this.tests[index].damage.size() - 1);

            this.tests[index].damage.getKeys().forEach((key: number) => {
                if (key !== 0) {
                    this.tests[index].damage.set(
                        key,
                        this.tests[index].damage.get(key) + removeCritical
                    );
                }
            });

            //Normalize above 0
            const minValue = this.tests[index].damage.minValue();
            if (minValue < 0) {
                this.tests[index].damage.getKeys().forEach((key: number) => {
                    this.tests[index].damage.set(
                        key,
                        this.tests[index].damage.get(key) - minValue + 1
                    );
                });
                this.tests[index].critical.getKeys().forEach((key: number) => {
                    this.tests[index].critical.set(
                        key,
                        this.tests[index].critical.get(key) - minValue + 1
                    );
                });
            }

            if (this.tests[index].critical.size() === 0) {
                this.tests[index].critical = data.chances;
            } else {
                this.tests[index].critical = Dice.mergeChances(
                    this.tests[index].critical,
                    data.chances,
                    true
                );
            }
        });

        this.buildChart(formsData);

        this.tests.forEach((test) => {
            this.legends.push({value: test.legend(), colors: test.colors});
        });
    }

    /**
     *
     */
    private expressionChance(
        expression: string,
        testIndex: number,
        damage: boolean
    ): Chances {
        let multiplicator = 1;
        if (expression.includes("*")) {
            const multiplication = expression.split("*");
            expression = multiplication[0];
            multiplicator = Number(multiplication[1]);
        }
        const dicesPlusSeparation: string[] = expression.split("+");
        let chances: Chances[] = [];
        let resultChances: Chances = new Chances();
        let sum: boolean[] = [];
        let damageBonus: number = 0;
        let hungerDices: number = 0;

        dicesPlusSeparation.forEach((separation) => {
            let reRoll: number;
            let hitDices: boolean = false;
            let critico: boolean = false;

            //Calculate chances only when this separation is a dice
            if (separation.includes("d")) {
                //Sum or minus dice
                if (separation.includes("-")) {
                    separation = separation.replace("-", "");
                    sum.push(false);
                } else {
                    sum.push(true);
                }

                //Check if is a reroll calculation
                if (separation.includes("r")) {
                    const rerollArray: string[] = this.reRoll(separation);
                    separation = rerollArray[0];
                    reRoll = Number(rerollArray[1]);
                } else {
                    reRoll = 0;
                }

                //Check if is a hitdice calculation
                if (separation.includes("h")) {
                    if (!(this.rpgSystem instanceof Vampire)) {
                        separation = separation.replace("h", "");
                        reRoll = 1;
                        hitDices = true;
                    } else {
                        let values = separation.split("h")
                        separation = values[0]
                        hungerDices = Number(values[1])
                    }
                }

                if (separation.includes("c")) {
                    separation = separation.replace("c", "");
                    critico = true;
                }

                if (
                    separation.includes(">") ||
                    separation.includes("<") ||
                    separation.includes("~")
                ) {
                    //Advantage/disadvantage calculation
                    chances.push(this.advantage(separation, reRoll));
                    // @ts-ignore
                } else if (this.rpgSystem instanceof Vampire) {
                    // @ts-ignore
                    let nDice: string | number;
                    let sides: string | number;
                    const splited = separation.split("d");
                    nDice = splited[0];
                    sides = splited[1];

                    const check: string[] = this.rpgSystem.defaultDice(nDice, sides);
                    nDice = Number(check[0]);
                    sides = Number(check[1]);

                    chances.push(this.rpgSystem.normalChance(nDice, sides, critico));

                    let criticals = this.rpgSystem.bestial(nDice, hungerDices, this.tests[testIndex].dc)
                    this.tests[testIndex].bestialSuccess = criticals[0]
                    this.tests[testIndex].bestialFailure = criticals[1]
                } else {
                    //Normal calculation
                    chances.push(this.normalChance(separation, reRoll, hitDices));
                }
            } else if (!damage) {
                this.tests[testIndex].bonus += Number(separation);
            } else {
                damageBonus = Number(separation);
            }
        });

        //Unify all chances
        resultChances = chances[0];
        for (let index = 1; index < chances.length; index++) {
            resultChances = Dice.mergeChances(
                resultChances,
                chances[index],
                sum[index]
            );
        }

        if (damage) {
            resultChances = this.rpgSystem.addBonus(resultChances, damageBonus);
        }

        if (!expression.includes("d")) {
            let bonusChance = new Chances();
            bonusChance.set(this.tests[testIndex].bonus, 1);
            resultChances = bonusChance;
        }

        resultChances = Dice.multiplyProbability(resultChances, multiplicator);

        return resultChances;
    }

    /**
     * @returns dice and reroll separated
     */
    private reRoll(separation: string): string[] {
        const splited: string[] = separation.split("r");
        let dice: string = splited[0];
        let reRoll: string = splited[1];
        return [dice, reRoll];
    }

    /**
     * @param separation Ex: 2>d20, 4d6~1
     * @returns Chances
     */
    private advantage(separation: string, reRoll: number) {
        let nDice: string;
        let sides: string;
        let positive: boolean = true;
        let nKeep: number = 1;

        separation = this.rpgSystem.advantage(separation);

        if (separation.includes(">")) {
            //Advantage
            const splited = separation.split(">d");
            nDice = splited[0];
            sides = splited[1];
        } else if (separation.includes("<")) {
            //Disadvantage
            const splited = separation.split("<d");
            nDice = splited[0];
            sides = splited[1];
            positive = false;
        } else if (separation.includes("~")) {
            //"nDice"d"sides"~"nRemove"
            let splited = separation.split("d");
            nDice = splited[0];
            splited = splited[1].split("~");
            sides = splited[0];
            //splided[1] = nRemove, how many dices are removed
            //nKeep is how many dices are used in the end
            nKeep = Number(nDice) - Number(splited[1]);
        }

        const check: string[] = this.rpgSystem.defaultDice(nDice, sides);
        nDice = check[0];
        sides = check[1];

        let chances

        if (nKeep === 1) {
            chances = Dice.advantageChances(
                Number(nDice),
                Number(sides),
                positive,
                reRoll !== 0
            );
        } else {
            chances = Dice.statusChances(
                Number(nDice),
                Number(sides),
                positive,
                nKeep,
                reRoll !== 0
            );
        }

        return chances
    }

    /**
     * Receives "nDice"d"sides", split and return chances
     * @param separation "nDice"d"sides"
     * @param reRoll Until which number must reroll
     * @param hitDices Hitdices calcultation always reroll
     * @returns Chances
     */
    private normalChance(separation: string, reRoll: number, hitDices: boolean) {
        let nDice: string;
        let sides: string;
        const splited = separation.split("d");
        nDice = splited[0];
        sides = splited[1];

        const check: string[] = this.rpgSystem.defaultDice(nDice, sides);
        nDice = check[0];
        sides = check[1];

        if (reRoll === 0) {
            return Dice.chances(nDice, sides);
        } else {
            //reRoll
            //hitDices checks always reroll ones
            return Dice.chancesReroll(nDice, sides, reRoll, hitDices);
        }
    }

    /**
     * Config and create chart
     */
    private buildChart(formsData: any[]) {
        //Config chart
        const graph = new Graph(formsData, this.rpgSystem, this.tests);

        //Destroy old chart
        if (this.chart) {
            this.chart.destroy();
        }

        //Create new chart
        this.chart = new Chart(
            document.getElementById("chart") as ChartItem,
            graph.getConfig()
        );
    }
}
