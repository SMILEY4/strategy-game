import {GameStore} from "../../_old_external/state/game/gameStore";
import {Command} from "../models/command";

export function useCommands(): Command[] {
    return GameStore.useState(state => state.commands);
}