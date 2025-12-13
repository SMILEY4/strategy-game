import {useQueryMultiple} from "../../../common/db/adapters/databaseHooks";
import {CommandDatabase} from "../../../state/database/commandDatabase";
import {Command} from "../../../models/command/command";
import {App} from "../../../appContext";

export function useCommands(): Command[] {
    return useQueryMultiple(App.commandDatabase, CommandDatabase.QUERY_ALL, null);
}