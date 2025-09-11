import {MapPrimaryStorage} from "../../common/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../../common/db/database/abstractDatabase";
import {Query} from "../../common/db/query/query";
import {DatabaseStorage, DatabaseStorageConfig} from "../../common/db/storage/databaseStorage";
import {ArraySupportingStorage} from "../../common/db/storage/supporting/arraySupportingStorage";
import {Command} from "../../models/command/command";

function provideId(e: Command): string {
    return e.id;
}

interface CommandStorageConfig extends DatabaseStorageConfig<Command, string> {
    primary: MapPrimaryStorage<Command, string>,
    supporting: {
        array: ArraySupportingStorage<Command>,
    }
}

class CommandStorage extends DatabaseStorage<CommandStorageConfig, Command, string> {

    constructor() {
        super({
            primary: new MapPrimaryStorage<Command, string>(provideId),
            supporting: {
                array: new ArraySupportingStorage<Command>(),
            },
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

    export const QUERY_BY_ID: CommandQuery<string | null> = {
        run(storage: CommandStorage, args: string): Command | null {
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