import {Command} from "../../models/command";
import {CommandStore} from "./store/commandStore";

export class GameRepository {

    addCommand(command: Command) {
        CommandStore.useState.getState().add(command);
    }

    setCommands(commands: Command[]) {
        CommandStore.useState.getState().set(commands);
    }

}