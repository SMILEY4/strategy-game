import type {SpriteSheetEntry, WasmRenderApp} from "wasm";
import {tracer} from "@modules/monitoring/tracer.ts";
import spritesheetMountains from "@pages/game/renderer/spritesheets/mountains.atlas.json";
import spritesheetHills from "@pages/game/renderer/spritesheets/hills.atlas.json";
import spritesheetTrees from "@pages/game/renderer/spritesheets/trees.atlas.json";
import spritesheetBuildings from "@pages/game/renderer/spritesheets/buildings.atlas.json";

export interface RenderWasmApiSetup {
    configureRenderer: () => Promise<void>,
}

export const renderWasmApiSetup = (wasm: WasmRenderApp): RenderWasmApiSetup => {
    return {

        configureRenderer: async () => {
            tracer.span({name: "wasmapi-configure"}, () => {
                console.log("[wasm-api]: configuring renderer");
                wasm.add_spritesheet_entries(1, spritesheetMountains.sprites.map(entry => ({
                    id: entry.id,
                    uvCoords: {
                        uMin: entry.uv.uMin,
                        vMin: entry.uv.vMin,
                        uMax: entry.uv.uMax,
                        vMax: entry.uv.vMax,
                    },
                    nSize: {
                        width: entry.normalized.width,
                        height: entry.normalized.height,
                    },
                    scale: 1.5,
                } satisfies SpriteSheetEntry)));
                wasm.add_spritesheet_entries(2, spritesheetHills.sprites.map(entry => ({
                    id: entry.id,
                    uvCoords: {
                        uMin: entry.uv.uMin,
                        vMin: entry.uv.vMin,
                        uMax: entry.uv.uMax,
                        vMax: entry.uv.vMax,
                    },
                    nSize: {
                        width: entry.normalized.width,
                        height: entry.normalized.height,
                    },
                    scale: 1.4,
                } satisfies SpriteSheetEntry)));
                wasm.add_spritesheet_entries(3, spritesheetTrees.sprites.map(entry => ({
                    id: entry.id,
                    uvCoords: {
                        uMin: entry.uv.uMin,
                        vMin: entry.uv.vMin,
                        uMax: entry.uv.uMax,
                        vMax: entry.uv.vMax,
                    },
                    nSize: {
                        width: entry.normalized.width,
                        height: entry.normalized.height,
                    },
                    scale: 0.7,
                } satisfies SpriteSheetEntry)));
                wasm.add_spritesheet_entries(4, spritesheetBuildings.sprites.map(entry => ({
                    id: entry.id,
                    uvCoords: {
                        uMin: entry.uv.uMin,
                        vMin: entry.uv.vMin,
                        uMax: entry.uv.uMax,
                        vMax: entry.uv.vMax,
                    },
                    nSize: {
                        width: entry.normalized.width,
                        height: entry.normalized.height,
                    },
                    scale: 0.8,
                } satisfies SpriteSheetEntry)));
            });
        },

    };
};