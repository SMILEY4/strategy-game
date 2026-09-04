import type {WasmRenderApp} from "wasm";
import {tracer} from "@modules/monitoring/tracer.ts";
import type {VertexDataResult} from "@modules/rendergraph/nodes/rg-node.transform-vertex-out.ts";

export interface RenderWasmApiDownload {
    downloadTileLandInstances: () => VertexDataResult;
    downloadTileWaterInstances: () => VertexDataResult;
    downloadTileFogOfWarInstances: () => VertexDataResult;
    downloadMapDetailVertices: () => VertexDataResult;
    downloadOverlayGridInstances: () => VertexDataResult;
    downloadOverlayFillInstances: () => VertexDataResult;
    downloadOverlayEdgeInstances: () => VertexDataResult;
}

export const renderWasmApiDownload = (wasm: WasmRenderApp): RenderWasmApiDownload => {
    return {

        downloadTileLandInstances: () => {
            return tracer.span({name: "wasmapi-downloadTileLandInstances"}, () => {
                return {
                    data: wasm.get_terrain_tile_land_instances(),
                    count: wasm.get_terrain_tile_land_instance_count(),
                };
            });
        },

        downloadTileWaterInstances: () => {
            return tracer.span({name: "wasmapi-downloadTileWaterInstances"}, () => {
                return {
                    data: wasm.get_terrain_tile_water_instances(),
                    count: wasm.get_terrain_tile_water_instance_count(),
                };
            });
        },

        downloadTileFogOfWarInstances: () => {
            return tracer.span({name: "wasmapi-downloadTileFogOfWarInstances"}, () => {
                return {
                    data: wasm.get_fog_of_war_tile_instances(),
                    count: wasm.get_fog_of_war_tile_instances_count(),
                };
            });
        },

        downloadMapDetailVertices: () => {
            return tracer.span({name: "wasmapi-downloadMapDetailVertices"}, () => {
                return {
                    data: wasm.get_map_detail_vertices(),
                    count: wasm.get_map_detail_vertex_count(),
                };
            });
        },

        downloadOverlayGridInstances: () => {
            return tracer.span({name: "wasmapi-downloadOverlayGridInstances"}, () => {
                return {
                    data: wasm.get_overlay_grid_instances(),
                    count: wasm.get_overlay_grid_instance_count(),
                };
            });
        },

        downloadOverlayFillInstances: () => {
            return tracer.span({name: "wasmapi-downloadOverlayFillInstances"}, () => {
                return {
                    data: wasm.get_overlay_fill_instances(),
                    count: wasm.get_overlay_fill_instance_count(),
                };
            });
        },

        downloadOverlayEdgeInstances: () => {
            return tracer.span({name: "wasmapi-downloadOverlayEdgeInstances"}, () => {
                return {
                    data: wasm.get_overlay_edge_instances(),
                    count: wasm.get_overlay_edge_instance_count(),
                };
            });
        },

    };
};