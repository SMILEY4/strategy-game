import {GameStore} from "../../_old_external/state/game/gameStore";
import {CommandPlaceScout} from "../models/command";

export function useScoutCommands(): CommandPlaceScout[] {
    return GameStore.useState(state => state.commands.filter(c => c.commandType === "place-scout") as CommandPlaceScout[]);
}