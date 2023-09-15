import {CommandStore} from "../../../logic/game/store/commandStore";
import {AppCtx} from "../../../logic/appContext";

export function useCommands() {
    return CommandStore.useState(state => state.commands);
}

export function useCommandCancel() {
    const commandService = AppCtx.di.get(AppCtx.DIQ.CommandService);
    return (id: string) => commandService.cancelCommand(id)
}