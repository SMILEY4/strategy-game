import {Command} from "../../models/command";
import {LocalCommandStateStore} from "../local/commands/LocalCommandStore";

export namespace CommandStateAccess {

    export function getRevId(): string {
        return LocalCommandStateStore.useState.getState().revId
    }

    export function getCommands(): Command[] {
        return LocalCommandStateStore.useState.getState().commands;
    }

    export function setCommands(commands: Command[]) {
        LocalCommandStateStore.useState.getState().set(commands);
    }

    export function addCommand(command: Command) {
        setCommands([
            ...getCommands(),
            command,
        ]);
    }

    export function removeCommand(id: string) {
        setCommands(getCommands().filter(cmd => cmd.id !== id));
    }

    export function useCommands(): Command[] {
        return LocalCommandStateStore.useState(state => state.commands)
    }

}