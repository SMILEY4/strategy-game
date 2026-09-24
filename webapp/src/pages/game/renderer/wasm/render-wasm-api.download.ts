import type {WasmRenderApp} from "wasm";
import {tracer} from "@modules/monitoring/tracer.ts";
import type {VertexDataResult} from "@modules/rendergraph/nodes/rg-node.transform-vertex-out.ts";

export interface RenderWasmApiDownload {
    getTileLandInstances: () => VertexDataResult;
    getTileWaterInstances: () => VertexDataResult;
    getWaterEdgeInstances: () => VertexDataResult;
    getTileFogOfWarInstances: () => VertexDataResult;
    getMapDetailVertices: () => VertexDataResult;
    getOverlayGridInstances: () => VertexDataResult;
    getOverlayFillInstances: () => VertexDataResult;
    getOverlayEdgeInstances: () => VertexDataResult;
    getRouteVertices: () => VertexDataResult;
    getRouteHighlightVertices: () => VertexDataResult;
}

export const renderWasmApiDownload = (wasm: WasmRenderApp): RenderWasmApiDownload => {
    return {

        getTileLandInstances: () => {
            return tracer.span({name: "wasmapi-getTileLandInstances"}, () => {
                return {
                    data: wasm.get_terrain_tile_land_instances(),
                    count: wasm.get_terrain_tile_land_instances_count(),
                };
            });
        },

        getTileWaterInstances: () => {
            return tracer.span({name: "wasmapi-getTileWaterInstances"}, () => {
                return {
                    data: wasm.get_terrain_tile_water_instances(),
                    count: wasm.get_terrain_tile_water_instances_count(),
                };
            });
        },

        getWaterEdgeInstances: () => {
            return tracer.span({name: "wasmapi-getWaterEdgeInstances"}, () => {
                return {
                    data: wasm.get_water_edge_instances(),
                    count: wasm.get_water_edge_instances_count(),
                };
            });
        },

        getTileFogOfWarInstances: () => {
            return tracer.span({name: "wasmapi-getTileFogOfWarInstances"}, () => {
                return {
                    data: wasm.get_fog_of_war_tile_instances(),
                    count: wasm.get_fog_of_war_tile_instances_count(),
                };
            });
        },

        getMapDetailVertices: () => {
            return tracer.span({name: "wasmapi-getMapDetailVertices"}, () => {
                return {
                    data: wasm.get_map_detail_vertices(),
                    count: wasm.get_map_detail_vertices_count(),
                };
            });
        },

        getOverlayGridInstances: () => {
            return tracer.span({name: "wasmapi-getOverlayGridInstances"}, () => {
                return {
                    data: wasm.get_overlay_grid_instances(),
                    count: wasm.get_overlay_grid_instances_count(),
                };
            });
        },

        getOverlayFillInstances: () => {
            return tracer.span({name: "wasmapi-getOverlayFillInstances"}, () => {
                return {
                    data: wasm.get_overlay_fill_instances(),
                    count: wasm.get_overlay_fill_instances_count(),
                };
            });
        },

        getOverlayEdgeInstances: () => {
            return tracer.span({name: "wasmapi-getOverlayEdgeInstances"}, () => {
                return {
                    data: wasm.get_overlay_edge_instances(),
                    count: wasm.get_overlay_edge_instances_count(),
                };
            });
        },

        getRouteVertices: () => {
            return tracer.span({name: "wasmapi-getRouteVertices"}, () => {
                return {
                    data: wasm.get_route_vertices(),
                    count: wasm.get_route_vertex_count(),
                };
            });
        },

        getRouteHighlightVertices: () => {
            return tracer.span({name: "wasmapi-getRouteHighlightVertices"}, () => {
                return {
                    data: wasm.get_route_highlight_vertices(),
                    count: wasm.get_route_highlight_vertex_count(),
                };
            });
        },

    };
};
