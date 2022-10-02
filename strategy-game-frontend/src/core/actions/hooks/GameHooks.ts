import {GameStateHooks} from "../../../external/state/game/gameStateHooks";
import {LocalGameStateHooks} from "../../../external/state/localgame/localGameStateHooks";

export namespace GameHooks {

    export function useCountryMoney(): number {
        const commands = LocalGameStateHooks.useCommands();
        const country = GameStateHooks.usePlayerCountry();
        const money = ((country && country.advancedData) ? country.advancedData.resources.money : 0);
        const commandCost = commands.map(cmd => cmd.cost.money).reduce((a, b) => a + b, 0);
        return money - commandCost;
    }

}