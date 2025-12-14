import {Command} from "../../../models/command/command";
import {CommandDatabase} from "../../database/commandDatabase";
import {useQueryMultiple} from "../../../common/db/adapters/databaseHooks";
import {Db} from "../../database";

export const CommandStateAccess = {

    useCommands(): Command[] {
        return useQueryMultiple(Db.command, CommandDatabase.QUERY_ALL, null);
    },

    getCommandsRevId(): string {
        return Db.command.getRevId();
    },

    getAll(): Command[] {
        return Db.command.queryMany(CommandDatabase.QUERY_ALL, null);
    },

    getAllOfType<T extends Command.Type>(type: T): (Command.Mapping[T])[] {
        return Db.command
            .queryMany(CommandDatabase.QUERY_ALL, null)
            .filter((it): it is Command.Mapping[T] => it.type === type);
    },

};