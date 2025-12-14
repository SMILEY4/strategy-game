import {Command} from "../../../models/command/command";
import {App} from "../../../appContext";
import {AudioType} from "../../../common/audioService";
import {Db} from "../../database";

export const CommandService = {

    addCommand<T extends Command>(command: T): void {
        Db.command.insert(command);
    },

    cancelCommand(id: Command.Id): void {
        Db.command.delete(id);
        AudioType.WRITING_ON_PAPER.play(App.audioService);
    },

};