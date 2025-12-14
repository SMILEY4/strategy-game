import {Command} from "../../../models/command/command";
import {App} from "../../../appContext";
import {AudioType} from "../../../common/audioService";

export const CommandService = {

    addCommand<T extends Command>(command: T): void {
        App.commandDatabase.insert(command);
    },

    cancelCommand(id: Command.Id): void {
        App.commandDatabase.delete(id);
        AudioType.WRITING_ON_PAPER.play(App.audioService);
    },

};