import {MapDatabaseStorage} from "../shared/db/storage/mapDatabaseStorage";
import {AbstractDatabase} from "../shared/db/database/abstractDatabase";
import {Query} from "../shared/db/query/query";
import {Command} from "../models/command";
import {AppCtx} from "../appContext";
import {useQueryMultiple, useQuerySingle} from "../shared/db/adapters/databaseHooks";
import {CommandType} from "../models/commandType";

function provideId(e: Command): string {
    return e.id;
}

class CommandStorage extends MapDatabaseStorage<Command, string> {
    constructor() {
        super(provideId);
    }
}

export class CommandDatabase extends AbstractDatabase<CommandStorage, Command, string> {
    constructor() {
        super(new CommandStorage(), provideId);
    }
}

interface CommandQuery<ARGS> extends Query<CommandStorage, Command, string, ARGS> {
}

export namespace CommandDatabase {

    export const QUERY_ALL: CommandQuery<void> = {
        run(storage: CommandStorage, args: void): Command[] {
            return storage.getAll();
        },
    };

    export const QUERY_BY_ID: CommandQuery<string> = {
        run(storage: CommandStorage, args: string): Command[] {
            const result = storage.getById(args);
            if (result === null) {
                return [];
            } else {
                return [result];
            }
        },
    };

    export const QUERY_BY_TYPE: CommandQuery<CommandType> = {
        run(storage: CommandStorage, args: CommandType): Command[] {
            return storage.getAll().filter(cmd => cmd.type === args);
        },
    };

    export function useCommands(): Command[] {
        return useQueryMultiple(AppCtx.CommandDatabase(), QUERY_ALL, null);
    }

    export function useCommandById(commandId: string): Command {
        const command = useQuerySingle(AppCtx.CommandDatabase(), QUERY_BY_ID, null);
        if (command) {
            return command;
        } else {
            throw new Error("No command with id " + commandId + " found");
        }
    }

}