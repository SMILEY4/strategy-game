import {useCommands} from "./useCommands";
import {useCountryPlayer} from "./useCountryPlayer";

export function useCountryMoney(): number {
    const commands = useCommands();
    const country = useCountryPlayer();
    const money = ((country && country.advancedData) ? country.advancedData.resources.money : 0);
    const commandCost = commands.map(cmd => cmd.cost.money).reduce((a, b) => a + b, 0);
    return money - commandCost;
}