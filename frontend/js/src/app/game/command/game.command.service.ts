import {Command} from "../../../models/command/command";
import {Db} from "../../database";
import {GameAudio} from "../../audio/gameAudio";

export const CommandService = {

    addCommand<T extends Command>(command: T): void {
        GameAudio.WRITING_ON_PAPER.play()
        Db.command.insert(command);
    },

    cancelCommand(id: Command.Id): void {
        GameAudio.WRITING_ON_PAPER.play()
        Db.command.delete(id);
    },

};