import {GameStore} from "../../external/state/game/gameStore";
import {Command} from "../models/command";

export function useCommands(): Command[] {
    return GameStore.useState(state => state.commands);
}