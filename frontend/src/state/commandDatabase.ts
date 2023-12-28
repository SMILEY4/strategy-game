import {MapPrimaryStorage} from "../shared/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../shared/db/database/abstractDatabase";
import {Query} from "../shared/db/query/query";
import {Command} from "../models/command";
import {AppCtx} from "../appContext";
import {useQueryMultiple, useQuerySingleOrThrow} from "../shared/db/adapters/databaseHooks";
import {CommandType} from "../models/commandType";
import {DatabaseStorage, DatabaseStorageConfig} from "../shared/db/storage/databaseStorage";
import {ArraySupportingStorage} from "../shared/db/storage/supporting/arraySupportingStorage";
import {MapSupportingStorage} from "../shared/db/storage/supporting/mapSupportingStorage";

function provideId(e: Command): string {
    return e.id;
}


interface CommandStorageConfig extends DatabaseStorageConfig<Command, string> {
    primary: MapPrimaryStorage<Command, string>,
    supporting: {
        array: ArraySupportingStorage<Command>,
        byType: MapSupportingStorage<Command, CommandType>
    }
}

class CommandStorage extends DatabaseStorage<CommandStorageConfig, Command, string> {
    constructor() {
        super({
            primary: new MapPrimaryStorage<Command, string>(provideId),
            supporting: {
                array: new ArraySupportingStorage<Command>(),
                byType: new MapSupportingStorage<Command, CommandType>(e => e.type)
            }
        });
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
            return storage.config.supporting.array.getAll()
        },
    };

    export const QUERY_BY_ID: CommandQuery<string> = {
        run(storage: CommandStorage, args: string): Command | null {
            return storage.get(args);
        },
    };

    export const QUERY_BY_TYPE: CommandQuery<CommandType> = {
        run(storage: CommandStorage, args: CommandType): Command[] {
            return storage.config.supporting.byType.getByKey(args)
        },
    };

    export function useCommands(): Command[] {
        return useQueryMultiple(AppCtx.CommandDatabase(), QUERY_ALL, null);
    }

    export function useCommandById(commandId: string): Command {
        return useQuerySingleOrThrow(AppCtx.CommandDatabase(), QUERY_BY_ID, null);
    }

}