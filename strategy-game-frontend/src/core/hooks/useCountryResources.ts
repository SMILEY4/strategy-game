import {Command} from "../../models/state/command";
import {Country} from "../../models/state/country";
import {useCommands} from "./useCommands";
import {useCountryPlayerOrNull} from "./useCountryPlayer";

export function useCountryResources(): {
    money: number,
    wood: number,
    food: number,
    stone: number,
    metal: number
} {
    const commands = useCommands();
    const country = useCountryPlayerOrNull();
    if (country === null) {
        return {
            money: 0,
            wood: 0,
            food: 0,
            stone: 0,
            metal: 0
        };
    } else {
        return {
            money: calculateMoney(country, commands),
            wood: country.dataTier3 ? country.dataTier3.resources.wood : 0,
            food: country.dataTier3 ? country.dataTier3.resources.food : 0,
            stone: country.dataTier3 ? country.dataTier3.resources.stone : 0,
            metal: country.dataTier3 ? country.dataTier3.resources.metal : 0,
        };
    }
}


function calculateMoney(country: Country, commands: Command[]): number {
    const money = ((country && country.dataTier3) ? country.dataTier3.resources.money : 0);
    const commandCost = commands.map(cmd => cmd.cost.money).reduce((a, b) => a + b, 0);
    return money - commandCost;
}