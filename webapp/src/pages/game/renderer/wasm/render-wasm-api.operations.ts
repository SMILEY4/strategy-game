import type {WasmRenderApp} from "wasm";
import {tracer} from "@modules/monitoring/tracer.ts";

export interface RenderWasmApiOperations {
    buildOverlayInstances: () => {
        overlayFillInstances: boolean,
        overlayEdgeInstances: boolean
    },
    collectChunks: () => {
        allChunks: boolean
    }
    cullChunks: () => {
        visibleChunks: boolean
    }
    buildTileInstances: () => {
        tileTerrainInstances: boolean,
        tileFogOfWarInstances: boolean,
        mapDetailVertices: boolean
    },
}

export const renderWasmApiOperations = (wasm: WasmRenderApp): RenderWasmApiOperations => {
    return {

        buildOverlayInstances: () => {
            return tracer.span({name: "wasmapi-buildOverlayInstances"}, () => {
                const changed = wasm.build_overlay_instances();
                return {
                    overlayEdgeInstances: changed,
                    overlayFillInstances: changed,
                };
            });
        },

        collectChunks: () => {
            return tracer.span({name: "wasmapi-collectChunks"}, () => {
                const changed = wasm.calculate_all_chunks();
                return {allChunks: changed};
            });
        },

        cullChunks: () => {
            return tracer.span({name: "wasmapi-cullChunks"}, () => {
                const changed = wasm.calculate_visible_chunks();
                return {visibleChunks: changed};
            });
        },

        buildTileInstances: () => {
            return tracer.span({name: "wasmapi-buildTileInstances"}, () => {
                const changed = wasm.calculate_terrain_tile_instances();
                return {
                    tileTerrainInstances: changed,
                    tileFogOfWarInstances: changed,
                    mapDetailVertices: changed,
                };
            });
        },

    };
};