import {Command} from "../../../models/command/command";
import {App} from "../../../appContext";
import {AudioType} from "../../../common/audioService";

export const CommandService = {

    addCommand<T extends Command>(command: T): void {
        App.gameStateWriter.addCommand(command);
    },

    cancelCommand(id: Command.Id): void {
        App.gameStateWriter.removeCommand(id);
        AudioType.WRITING_ON_PAPER.play(App.audioService);
    }

}