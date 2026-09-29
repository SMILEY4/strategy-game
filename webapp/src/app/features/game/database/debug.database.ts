import {DatabaseBuilder} from "@modules/gamedb/database-builder.ts";
import type {SingletonDatabase} from "@modules/gamedb/singleton/singleton-database.ts";

export type DebugData = {
    renderer: {
        randomHexOffsetScale: number,
        landMask: {
            noise1Scale: number,
            noise1Amplitude: number,
            noise2Scale: number,
            noise2Amplitude: number,
        },
        baseTerrain: {
            scale: number,
        },
        fogOfWar: {
            scale: number,
        },
        highlights: {
            selectedTile: {
                color: string,
            },
            availableTiles: {
                defaultColor: string,
                hoverColor: string,
            },
        },
        grid: {
            thickness: number,
            color: string,
        },
        colorGrading: {
            exposure: number,
            temperature: number,
            tint: number,
            brightness: number,
            contrast: number,
            blacks: number,
            whites: number,
            shadows: number,
            highlights: number,
            vibrance: number,
            saturation: number,
        },
    },
};

export const initialDebugDataValues: DebugData = {
    renderer: {
        randomHexOffsetScale: 0.2,
        landMask: {
            noise1Scale: 1.45 * 0.5,
            noise1Amplitude: 0.12,
            noise2Scale: 1.45,
            noise2Amplitude: 0.12,
        },
        baseTerrain: {
            scale: 1.6,
        },
        fogOfWar: {
            scale: 1.32,
        },
        highlights: {
            selectedTile: {
                color: "#ffffff",
            },
            availableTiles: {
                defaultColor: "#ccccff",
                hoverColor: "#ffffff",
            },
        },
        grid: {
            thickness: 0.02,
            color: "#edc663",
        },
        colorGrading: {
            exposure: 0,
            temperature: 0,
            tint: 0,
            brightness: 0,
            contrast: 0,
            blacks: 0,
            whites: 0,
            shadows: 0,
            highlights: 0,
            vibrance: 0,
            saturation: 0,
        },
    },
};

export type DebugDatabase = SingletonDatabase<DebugData>

export function debugDatabase(): DebugDatabase {
    return DatabaseBuilder
        .createSingleton<DebugData>()
        .withInitialValue(initialDebugDataValues)
        .build();
}
