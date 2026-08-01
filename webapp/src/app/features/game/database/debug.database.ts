import {DatabaseBuilder} from "@modules/gamedb/database-builder.ts";
import type {SingletonDatabase} from "@modules/gamedb/singleton/singleton-database.ts";

export type DebugData = {
    renderer: {
        randomHexOffsetScale: number,
        baseTerrain: {
            scale: number,
        },
        terrainMask: {
            scale: number,
            cutoff: number
        },
        fogOfWar: {
            scale: number,
        }
    }
}

export const initialDebugDataValues: DebugData = {
    renderer: {
        randomHexOffsetScale: 0.2,
        baseTerrain: {
            scale: 1.6,
        },
        terrainMask: {
            scale: 1.62,
            cutoff: 0.85
        },
        fogOfWar: {
            scale: 1.32,
        }
    }
}

export type DebugDatabase = SingletonDatabase<DebugData>

export function debugDatabase(): DebugDatabase {
    return DatabaseBuilder
        .createSingleton<DebugData>()
        .withInitialValue(initialDebugDataValues)
        .build();
}