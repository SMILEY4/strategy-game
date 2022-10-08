import {GameStore} from "../../external/state/game/gameStore";
import {CommandPlaceScout} from "../../models/state/command";

export function useScoutCommands(): CommandPlaceScout[] {
    return GameStore.useState(state => state.commands.filter(c => c.commandType === "place-scout") as CommandPlaceScout[]);
}