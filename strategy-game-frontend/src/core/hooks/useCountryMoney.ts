import {useCommands} from "./useCommands";
import {useCountryPlayerOrNull} from "./useCountryPlayer";

export function useCountryMoney(): number {
    const commands = useCommands();
    const country = useCountryPlayerOrNull();
    if (country === null) {
        return 0;
    }
    const money = ((country && country.advancedData) ? country.advancedData.resources.money : 0);
    const commandCost = commands.map(cmd => cmd.cost.money).reduce((a, b) => a + b, 0);
    return money - commandCost;
}