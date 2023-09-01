import {CommandStore} from "../../../logic/game/store/commandStore";

export function useCommands() {
    return CommandStore.useState(state => state.commands);
}