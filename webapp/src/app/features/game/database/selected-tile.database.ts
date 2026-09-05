import {DatabaseBuilder} from "@modules/gamedb/database-builder.ts";
import type {SingletonDatabase} from "@modules/gamedb/singleton/singleton-database.ts";
import type {HexPosition} from "@app/features/game/models/hex-position.ts";

export type SelectedTile = HexPosition & { id: number }

export type SelectedTileDatabase = SingletonDatabase<{ selected: SelectedTile | null }>

export function selectedTileDatabase(): SelectedTileDatabase {
    return DatabaseBuilder
        .createSingleton<{ selected: SelectedTile | null }>()
        .withInitialValue({
            selected: null,
        })
        .build();
}