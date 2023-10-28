import {Command} from "../../models/command";
import {LocalCommandStateStore} from "../local/LocalCommandStore";

export class CommandRepository {

    public getRevId(): string {
        return LocalCommandStateStore.useState.getState().revId;
    }

    public getCommands(): Command[] {
        return LocalCommandStateStore.useState.getState().commands;
    }

    public setCommands(commands: Command[]) {
        LocalCommandStateStore.useState.getState().set(commands);
    }

    public addCommand(command: Command) {
        this.setCommands([
            ...this.getCommands(),
            command,
        ]);
    }

    public removeCommand(id: string) {
        this.setCommands(this.getCommands().filter(cmd => cmd.id !== id));
    }

}

export namespace CommandRepository {

    export function useCommands(): Command[] {
        return LocalCommandStateStore.useState(state => state.commands);
    }

}