import {MapPrimaryStorage} from "../../common/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../../common/db/database/abstractDatabase";
import {Query} from "../../common/db/query/query";
import {DatabaseStorage, DatabaseStorageConfig} from "../../common/db/storage/databaseStorage";
import {ArraySupportingStorage} from "../../common/db/storage/supporting/arraySupportingStorage";
import {Command} from "../../models/command/command";

function provideId(e: Command): Command.Id {
    return e.id;
}

interface CommandStorageConfig extends DatabaseStorageConfig<Command, Command.Id> {
    primary: MapPrimaryStorage<Command, Command.Id>,
    supporting: {
        array: ArraySupportingStorage<Command>,
    }
}

class CommandStorage extends DatabaseStorage<CommandStorageConfig, Command, Command.Id> {

    constructor() {
        super({
            primary: new MapPrimaryStorage<Command, Command.Id>(provideId),
            supporting: {
                array: new ArraySupportingStorage<Command>(),
            },
        });
    }
}

export class CommandDatabase extends AbstractDatabase<CommandStorage, Command, Command.Id> {
    constructor() {
        super(new CommandStorage(), provideId);
    }
}

interface CommandQuery<ARGS> extends Query<CommandStorage, Command, Command.Id, ARGS> {
}


export namespace CommandDatabase {

    export const QUERY_BY_ID: CommandQuery<Command.Id | null> = {
        run(storage: CommandStorage, args: Command.Id): Command | null {
            if (args === null) {
                return null;
            }
            return storage.config.primary.get(args);
        },
    };

    export const QUERY_ALL: CommandQuery<void> = {
        run(storage: CommandStorage, args: void): Command[] {
            return storage.config.supporting.array.getAll();
        },
    };

}