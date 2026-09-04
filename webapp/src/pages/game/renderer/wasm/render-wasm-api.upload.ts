import type {WasmRenderApp} from "wasm";
import {tracer} from "@modules/monitoring/tracer.ts";
import type {Tile} from "@app/features/game/models/tile.ts";
import type {RenderEntity} from "@pages/game/renderer/data/render-entity.ts";
import type {MapMode} from "@app/features/game/models/map-mode.ts";
import type {Entity} from "@app/features/game/models/entity.ts";
import {wasmSerializer} from "@modules/utilities/wasm-serializer.ts";
import {memory as wasmMemory} from "wasm/wasm_bg.wasm";

export interface RenderWasmApiUpload {
    uploadTiles: (tiles: Tile[]) => void,
    uploadEntities: (entities: RenderEntity[]) => void,
    setMapMode: (mapMode: MapMode) => void,
    setSelectedEntityId: (entity: Entity | null) => void,
}

type TileUpload = {
    tile: Tile,
    controlOffset: number,
    controlCount: number,
};

type ControlUpload = {
    realmId: number,
    entityId: number,
    amount: number,
};

const tileSerializer = wasmSerializer<TileUpload>({
    "tile_position.q": {
        provider: tile => tile.tile.position.q,
        type: "i32",
    },
    "tile_position.r": {
        provider: tile => tile.tile.position.r,
        type: "i32",
    },
    "chunk_position.q": {
        provider: tile => tile.tile.position.chunkQ,
        type: "i32",
    },
    "chunk_position.r": {
        provider: tile => tile.tile.position.chunkR,
        type: "i32",
    },
    "visibility": {
        provider: tile => visibilitySerialisationMapping[tile.tile.visibility],
        type: "u8",
    },
    "terrain_elevation": {
        provider: tile => tile.tile.world.visible ? (tileElevationSerialisationMapping[tile.tile.world.value.elevation] ?? 0) : 0,
        type: "u8",
    },
    "terrain_biome": {
        provider: tile => tile.tile.world.visible ? (tileBiomeSerialisationMapping[tile.tile.world.value.biome] ?? 0) : 0,
        type: "u8",
    },
    "terrain_feature": {
        provider: tile => tile.tile.world.visible ? (tileFeatureSerialisationMapping[tile.tile.world.value.feature] ?? 0) : 0,
        type: "u8",
    },
    "meta.seed": {
        provider: tile => tile.tile.meta.seed,
        type: "u32",
    },
    "control_offset": {
        provider: tile => tile.controlOffset,
        type: "u32",
    },
    "control_count": {
        provider: tile => tile.controlCount,
        type: "u32",
    },
    "create_settlement_validity": {
        provider: tile => {
            if (!tile.tile.createSettlement.visible) return 0;
            let validity = 0;
            if (tile.tile.createSettlement.value.validLocation) {
                validity = 1;
                if (tile.tile.createSettlement.value.validRealm) {
                    validity = 2;
                }
            }
            return validity;
        },
        type: "u8",
    },
});

const controlSerializer = wasmSerializer<ControlUpload>({
    "realm_id": {provider: control => control.realmId, type: "u32"},
    "entity_id": {provider: control => control.entityId, type: "u32"},
    "amount": {provider: control => control.amount, type: "f32"},
});

const visibilitySerialisationMapping: Record<string, number> = {
    undefined: 0,
    "UNDISCOVERED": 0,
    "DISCOVERED": 1,
    "VISIBLE": 2,
};

const tileElevationSerialisationMapping: Record<string, number> = {
    undefined: 0,
    "FLAT": 1,
    "HILLS": 2,
    "MOUNTAINS": 3,
};

const tileBiomeSerialisationMapping: Record<string, number> = {
    undefined: 0,
    "OCEAN": 1,
    "GRASSLAND": 2,
};

const tileFeatureSerialisationMapping: Record<string, number> = {
    undefined: 0,
    "FOREST": 1,
};

const entitySerializer = wasmSerializer<RenderEntity>({
    "tile_position.q": {
        provider: entity => entity.position.q,
        type: "i32",
    },
    "tile_position.r": {
        provider: entity => entity.position.r,
        type: "i32",
    },
    "chunk_position.q": {
        provider: entity => entity.position.chunkQ,
        type: "i32",
    },
    "chunk_position.r": {
        provider: entity => entity.position.chunkR,
        type: "i32",
    },
    "render_type": {
        provider: entity => entityRenderTypeSerialisationMapping[entity.renderType],
        type: "u8",
    },
    "is_pending": {
        provider: entity => entity.isPending,
        type: "bool",
    },
});

const entityRenderTypeSerialisationMapping: Record<string, number> = {
    undefined: 0,
    "settlement": 1,
};


export const renderWasmApiUpload = (wasm: WasmRenderApp): RenderWasmApiUpload => {
    return {

        uploadTiles: (tiles: Tile[]) => {
            tracer.span({name: "wasmapi-uploadTiles"}, () => {

                const controls: ControlUpload[] = [];

                const serializedTiles: TileUpload[] = tiles.map(tile => {
                    const tileControls = tile.political.visible ? tile.political.value.control : [];
                    const controlOffset = controls.length;
                    controls.push(...tileControls.map(control => ({
                        realmId: control.realm,
                        entityId: control.entity,
                        amount: control.amount,
                    })));
                    return {tile, controlOffset, controlCount: tileControls.length};
                });

                const tilesMemory = wasm.tiles_reserve_memory(tiles.length);
                const tilesBuffer = new Uint8Array(wasmMemory.buffer, tilesMemory.ptr, tilesMemory.len * tilesMemory.item_size);
                tileSerializer(tilesBuffer, serializedTiles);
                wasm.tiles_upload(tilesMemory.ptr, tilesMemory.len);

                const controlsMemory = wasm.tile_control_values_reserve_memory(controls.length);
                const controlsBuffer = new Uint8Array(wasmMemory.buffer, controlsMemory.ptr, controlsMemory.len * controlsMemory.item_size);
                controlSerializer(controlsBuffer, controls);
                wasm.tile_control_values_upload(controlsMemory.ptr, controlsMemory.len);
            });
        },

        uploadEntities: (entities: RenderEntity[]) => {
            tracer.span({name: "wasmapi-uploadEntities"}, () => {
                const memory = wasm.entities_reserve_memory(entities.length);
                const buffer = new Uint8Array(wasmMemory.buffer, memory.ptr, memory.len * memory.item_size);
                entitySerializer(buffer, entities);
                wasm.entities_upload(memory.ptr, memory.len);
            });
        },

        setMapMode: (mapMode: MapMode) => {
            tracer.span({name: "wasmapi-setMapMode"}, () => {
                wasm.set_map_mode(mapMode.numericId);
            });
        },

        setSelectedEntityId: (entity: Entity | null) => {
            tracer.span({name: "wasmapi-setSelectedEntityId"}, () => {
                wasm.set_selected_entity_id(entity ? entity.id : null);
            });
        },

    };
};