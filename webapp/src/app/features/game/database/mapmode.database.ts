import {DatabaseBuilder} from "@modules/gamedb/database-builder.ts";
import type {SingletonDatabase} from "@modules/gamedb/singleton/singleton-database.ts";
import {MapMode} from "@app/features/game/models/map-mode.ts";

export type MapModeDatabase = SingletonDatabase<MapMode>

export function mapModeDatabase(): MapModeDatabase {
    return DatabaseBuilder
        .createSingleton<MapMode>()
        .withInitialValue(MapMode.TERRAIN)
        .build();
}