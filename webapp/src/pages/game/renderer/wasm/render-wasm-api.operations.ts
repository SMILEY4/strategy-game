import type {WasmRenderApp} from "wasm";
import {tracer} from "@modules/monitoring/tracer.ts";

export interface RenderWasmApiOperations {
    calculateOverlayInstances: () => {
        overlayFillInstances: boolean,
        overlayEdgeInstances: boolean
    },
    calculateAllChunks: () => {
        allChunks: boolean
    }
    calculateVisibleChunks: () => {
        visibleChunks: boolean
    }
    calculateTileInstances: () => {
        tileTerrainInstances: boolean,
        tileFogOfWarInstances: boolean,
        mapDetailVertices: boolean
    },
}

export const renderWasmApiOperations = (wasm: WasmRenderApp): RenderWasmApiOperations => {
    return {

        calculateOverlayInstances: () => {
            return tracer.span({name: "wasmapi-calculateOverlayInstances"}, () => {
                const changed = wasm.calculate_overlay_instances();
                return {
                    overlayEdgeInstances: changed,
                    overlayFillInstances: changed,
                };
            });
        },

        calculateAllChunks: () => {
            return tracer.span({name: "wasmapi-calculateAllChunks"}, () => {
                const changed = wasm.calculate_all_chunks();
                return {allChunks: changed};
            });
        },

        calculateVisibleChunks: () => {
            return tracer.span({name: "wasmapi-calculateVisibleChunks"}, () => {
                const changed = wasm.calculate_visible_chunks();
                return {visibleChunks: changed};
            });
        },

        calculateTileInstances: () => {
            return tracer.span({name: "wasmapi-calculateTileInstances"}, () => {
                const changed = wasm.calculate_tile_instances();
                return {
                    tileTerrainInstances: changed,
                    tileFogOfWarInstances: changed,
                    mapDetailVertices: changed,
                };
            });
        },

    };
};
