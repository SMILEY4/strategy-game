import type {WasmRenderApp} from "wasm";
import {tracer} from "@modules/monitoring/tracer.ts";

export interface RenderWasmApiOperations {
    calculateOverlayInstances: () => {
        overlayFillInstances: boolean,
        overlayEdgeInstances: boolean,
        routeHighlightVertices: boolean
    },
    calculateAllChunks: () => {
        allChunks: boolean
    }
    calculateVisibleChunks: () => {
        visibleChunks: boolean
    }
    calculateWorldMesh: () => {
        tileLandInstances: boolean,
        tileWaterInstances: boolean,
        waterEdgeInstances: boolean,
        tileFogOfWarInstances: boolean,
        mapDetailVertices: boolean,
        routeVertices: boolean,
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
                    routeHighlightVertices: changed,
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

        calculateWorldMesh: () => {
            return tracer.span({name: "wasmapi-calculate_world_mesh"}, () => {
                const changed = wasm.calculate_world_mesh();
                return {
                    tileLandInstances: changed,
                    tileWaterInstances: changed,
                    waterEdgeInstances: changed,
                    tileFogOfWarInstances: changed,
                    mapDetailVertices: changed,
                    routeVertices: changed,
                };
            });
        },

    };
};
