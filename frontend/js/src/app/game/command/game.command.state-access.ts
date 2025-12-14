import {Command} from "../../../models/command/command";
import {CommandDatabase} from "../../../state/database/commandDatabase";
import {App} from "../../../appContext";
import {useQueryMultiple} from "../../../common/db/adapters/databaseHooks";

export const CommandStateAccess = {

    useCommands(): Command[] {
        return useQueryMultiple(App.commandDatabase, CommandDatabase.QUERY_ALL, null);
    },

    getCommandsRevId(): string {
        return App.commandDatabase.getRevId();
    },

    getAll(): Command[] {
        return App.commandDatabase.queryMany(CommandDatabase.QUERY_ALL, null);
    },

    getAllOfType<T extends Command.Type>(type: T): (Command.Mapping[T])[] {
        return App.commandDatabase
            .queryMany(CommandDatabase.QUERY_ALL, null)
            .filter((it): it is Command.Mapping[T] => it.type === type);
    },

};