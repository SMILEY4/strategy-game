import {GameStore} from "../../external/state/game/gameStore";
import {Command} from "../../models/state/command";

export function useCommands(): Command[] {
    return GameStore.useState(state => state.commands);
}