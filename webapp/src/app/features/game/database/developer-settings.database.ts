import {DatabaseBuilder} from "@modules/gamedb/database-builder.ts";
import type {SingletonDatabase} from "@modules/gamedb/singleton/singleton-database.ts";

export type DeveloperSettings = {
    renderer: {
        geometry: {
            hexOffsetScale: number,
        },
        terrain: {
            landMask: {
                noise1Scale: number,
                noise1Amplitude: number,
                noise2Scale: number,
                noise2Amplitude: number,
            },
            base: {
                scale: number,
                landLightColor: string,
                landDarkColor: string,
                waterLightColor: string,
                waterDarkColor: string,
            },
            coastline: {
                edgeSoftness: number,
                edgeThreshold: number,
            },
        },
        fogOfWar: {
            tileScale: number,
            discoveredOpacity: number,
        },
        tileHighlights: {
            selected: {
                color: string,
                scale: number,
                height: number,
                concealedOpacity: number,
            },
            available: {
                color: string,
                hoverColor: string,
            },
        },
        tileGrid: {
            color: string,
            thickness: number,
            fadeDistance: number,
        },
        overlays: {
            fill: {
                noiseScale: number,
                noiseStrength: number,
            },
            border: {
                concealedOpacity: number,
            },
            route: {
                color: string,
            },
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

export const initialDeveloperSettings: DeveloperSettings = {
    renderer: {
        geometry: {
            hexOffsetScale: 0.2,
        },
        terrain: {
            landMask: {
                noise1Scale: 1.45 * 0.5,
                noise1Amplitude: 0.12,
                noise2Scale: 1.45,
                noise2Amplitude: 0.12,
            },
            base: {
                scale: 1.6,
                landLightColor: "#678c34",
                landDarkColor: "#5a7f27",
                waterLightColor: "#8fa6ac",
                waterDarkColor: "#809fb2",
            },
            coastline: {
                edgeSoftness: 0.1,
                edgeThreshold: 0.15,
            },
        },
        fogOfWar: {
            tileScale: 1.32,
            discoveredOpacity: 0.65,
        },
        tileHighlights: {
            selected: {
                color: "#ffffffff",
                scale: 1,
                height: 4,
                concealedOpacity: 0.4,
            },
            available: {
                color: "#ccccffff",
                hoverColor: "#ffffffff",
            },
        },
        tileGrid: {
            color: "#ecc5627f",
            thickness: 0.02,
            fadeDistance: 4,
        },
        overlays: {
            fill: {
                noiseScale: 0.8,
                noiseStrength: 0.5,
            },
            border: {
                concealedOpacity: 0.3,
            },
            route: {
                color: "#ffffff",
            },
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

export type DeveloperSettingsDatabase = SingletonDatabase<DeveloperSettings>

export function developerSettingsDatabase(): DeveloperSettingsDatabase {
    return DatabaseBuilder
        .createSingleton<DeveloperSettings>()
        .withInitialValue(initialDeveloperSettings)
        .build();
}
