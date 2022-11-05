import {Command} from "../models/command";
import {Country} from "../models/country";
import {ResourceValue} from "../models/resourceValue";
import {useCommands} from "./useCommands";
import {useCountryPlayerOrNull} from "./useCountryPlayer";

export function useCountryResources(): { money: ResourceValue, wood: ResourceValue, food: ResourceValue, stone: ResourceValue, metal: ResourceValue } {
    const commands = useCommands();
    const country = useCountryPlayerOrNull();
    if (country === null) {
        return {
            money: {type: "money", value: 0, change: 0},
            wood: {type: "wood", value: 0, change: 0},
            food: {type: "food", value: 0, change: 0},
            stone: {type: "stone", value: 0, change: 0},
            metal: {type: "metal", value: 0, change: 0}
        };
    } else {
        return {
            money: {
                type: "money",
                value: calculateMoney(country, commands),
                change: country.dataTier3 ? country.dataTier3.resources.money.change : 0
            },
            wood: {
                type: "wood",
                value: calculateWood(country, commands),
                change: country.dataTier3 ? country.dataTier3.resources.wood.change : 0
            },
            food: {
                type: "food",
                value: calculateFood(country, commands),
                change: country.dataTier3 ? country.dataTier3.resources.food.change : 0
            },
            stone: {
                type: "stone",
                value: calculateStone(country, commands),
                change: country.dataTier3 ? country.dataTier3.resources.stone.change : 0
            },
            metal: {
                type: "metal",
                value: calculateMetal(country, commands),
                change: country.dataTier3 ? country.dataTier3.resources.metal.change : 0
            }
        };
    }
}

function calculateMoney(country: Country, commands: Command[]): number {
    const resources = ((country && country.dataTier3) ? country.dataTier3.resources.money.value : 0);
    const commandCost = commands.map(cmd => cmd.cost.money).reduce((a, b) => a + b, 0);
    return resources - commandCost;
}

function calculateWood(country: Country, commands: Command[]): number {
    const resources = ((country && country.dataTier3) ? country.dataTier3.resources.wood.value : 0);
    const commandCost = commands.map(cmd => cmd.cost.wood).reduce((a, b) => a + b, 0);
    return resources - commandCost;
}

function calculateStone(country: Country, commands: Command[]): number {
    const resources = ((country && country.dataTier3) ? country.dataTier3.resources.stone.value : 0);
    const commandCost = commands.map(cmd => cmd.cost.stone).reduce((a, b) => a + b, 0);
    return resources - commandCost;
}

function calculateFood(country: Country, commands: Command[]): number {
    const resources = ((country && country.dataTier3) ? country.dataTier3.resources.food.value : 0);
    const commandCost = commands.map(cmd => cmd.cost.food).reduce((a, b) => a + b, 0);
    return resources - commandCost;
}

function calculateMetal(country: Country, commands: Command[]): number {
    const resources = ((country && country.dataTier3) ? country.dataTier3.resources.metal.value : 0);
    const commandCost = commands.map(cmd => cmd.cost.metal).reduce((a, b) => a + b, 0);
    return resources - commandCost;
}