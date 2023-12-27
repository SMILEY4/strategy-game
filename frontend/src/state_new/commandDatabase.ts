import {MapDatabaseStorage} from "../shared/db/storage/mapDatabaseStorage";
import {Country} from "../models/country";
import {AbstractDatabase} from "../shared/db/database/abstractDatabase";
import {Query} from "../shared/db/query/query";
import {City} from "../models/city";
import {Command} from "../models/command";

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