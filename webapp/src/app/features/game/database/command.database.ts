import {MapPrimaryDatabaseStorageUnit} from "@modules/gamedb/storage/implementations/database-storage-unit.primary.map.ts";
import type {Query} from "@modules/gamedb/database/query.ts";
import type {Database} from "@modules/gamedb/database/database.ts";
import {DatabaseBuilder} from "@modules/gamedb/database-builder.ts";
import type {Command} from "@app/features/game/models/command.ts";


export type CommandDatabase = Database<CommandStorageMapping, Command, string>

type CommandStorageMapping = {
    primary: MapPrimaryDatabaseStorageUnit<Command, string>,
}

export function commandDatabase(): CommandDatabase {
    return DatabaseBuilder.create<Command, string, CommandStorageMapping>()
        .withIdProvider(e => e.id)
        .withStorage(idProvider => ({
            primary: new MapPrimaryDatabaseStorageUnit<Command, string>(idProvider),
        }))
        .build();
}

export type CommandQuery<ARGS> = Query<CommandStorageMapping, Command, string, ARGS>


export const CommandQueries = {

    ALL: {
        run: (storage: CommandStorageMapping) => {
            return storage.primary.getAll();
        },
    },

} satisfies {
    ALL: CommandQuery<never>,
};