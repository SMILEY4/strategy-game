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
        },
        selectedTile: {
            thickness: number,
            softness: number,
            color: [number, number, number, number]
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
        },
        selectedTile: {
            thickness: 0.1,
            softness: 0.02,
            color: [ 0.9294117647058824, 0.7764705882352941, 0.39215686274509803, 0.77 ]
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