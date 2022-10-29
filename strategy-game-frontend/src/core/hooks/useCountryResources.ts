import {Command} from "../models/command";
import {Country} from "../models/country";
import {useCommands} from "./useCommands";
import {useCountryPlayerOrNull} from "./useCountryPlayer";

export function useCountryResources(): { money: number, wood: number, food: number, stone: number, metal: number } {
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
            wood: calculateWood(country, commands),
            food: calculateFood(country, commands),
            stone: calculateStone(country, commands),
            metal: calculateMetal(country, commands),
        };
    }
}

function calculateMoney(country: Country, commands: Command[]): number {
    const resources = ((country && country.dataTier3) ? country.dataTier3.resources.money : 0);
    const commandCost = commands.map(cmd => cmd.cost.money).reduce((a, b) => a + b, 0);
    return resources - commandCost;
}

function calculateWood(country: Country, commands: Command[]): number {
    const resources = ((country && country.dataTier3) ? country.dataTier3.resources.wood : 0);
    const commandCost = commands.map(cmd => cmd.cost.wood).reduce((a, b) => a + b, 0);
    return resources - commandCost;
}

function calculateStone(country: Country, commands: Command[]): number {
    const resources = ((country && country.dataTier3) ? country.dataTier3.resources.stone : 0);
    const commandCost = commands.map(cmd => cmd.cost.stone).reduce((a, b) => a + b, 0);
    return resources - commandCost;
}

function calculateFood(country: Country, commands: Command[]): number {
    const resources = ((country && country.dataTier3) ? country.dataTier3.resources.food : 0);
    const commandCost = commands.map(cmd => cmd.cost.food).reduce((a, b) => a + b, 0);
    return resources - commandCost;
}

function calculateMetal(country: Country, commands: Command[]): number {
    const resources = ((country && country.dataTier3) ? country.dataTier3.resources.metal : 0);
    const commandCost = commands.map(cmd => cmd.cost.metal).reduce((a, b) => a + b, 0);
    return resources - commandCost;
}