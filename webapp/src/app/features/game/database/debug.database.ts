import {DatabaseBuilder} from "@modules/gamedb/database-builder.ts";
import type {SingletonDatabase} from "@modules/gamedb/singleton/singleton-database.ts";

export type DebugColor = [number, number, number, number];

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
                color: DebugColor,
            },
            availableTiles: {
                defaultColor: DebugColor,
                hoverColor: DebugColor,
            },
        },
        grid: {
            thickness: number,
            color: DebugColor,
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
                color: [1, 1, 1, 1],
            },
            availableTiles: {
                defaultColor: [0.8, 0.8, 1, 1],
                hoverColor: [1, 1, 1, 1],
            },
        },
        grid: {
            thickness: 0.02,
            color: [0.9294117647058824, 0.7764705882352941, 0.39215686274509803, 0.3],
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
