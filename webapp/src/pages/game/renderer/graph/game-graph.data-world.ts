import type {GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {RenderWasmApi} from "@pages/game/renderer/wasm/render-wasm-api.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import {type Entity, EntityUtils} from "@app/features/game/models/entity.ts";
import type {Camera} from "@app/features/game/models/camera.ts";
import type {Tile} from "@app/features/game/models/tile.ts";
import type {Command} from "@app/features/game/models/command.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";
import type {RenderEntity} from "@pages/game/renderer/data/render-entity.ts";


export function gameGraphDataWorld(
    g: RenderGraphBuilder,
    dataProvider: GameRendererDataProvider,
    wasmApi: RenderWasmApi,
    inputs: {
        dataCamera: DataRenderGraphNode<VersionedContainer<Camera>>
    },
) {

    const dataAllTiles = g.dataExternal<VersionedContainer<Tile[]>>(
        prev => prev?.revId !== dataProvider.getTiles().revId,
        () => dataProvider.getTiles().load(),
    );

    const wasmAllTiles = g.wasmData({
        source: {
            type: "js",
            data: dataAllTiles,
            upload: (tiles: VersionedContainer<Tile[]>) => wasmApi.upload.uploadTiles(tiles.data),
        },
    });

    const dataAllEntities = g.dataExternal<VersionedContainer<Entity[]>>(
        prev => prev?.revId !== dataProvider.getEntities().revId,
        () => dataProvider.getEntities().load(),
    );

    const dataAllCommands = g.dataExternal<VersionedContainer<Command[]>>(
        prev => prev?.revId !== dataProvider.getCommands().revId,
        () => dataProvider.getCommands().load(),
    );

    const renderEntityTransformer = g.transform<[VersionedContainer<Entity[]>, VersionedContainer<Command[]>], RenderEntity[]>({
        inputs: [dataAllEntities, dataAllCommands],
        func: (entities, commands) => {
            return [
                ...entities.data.map(entity => {
                    if (EntityUtils.hasComponent(entity, "settlement")) {
                        return {
                            ...entity,
                            renderType: "settlement",
                            isPending: false,
                        } satisfies RenderEntity;
                    }
                    return null;
                }),
                ...commands.data.map(command => {
                    if (command.type === "create-settlement") {
                        return {
                            id: 0,
                            owner: null,
                            position: command.location,
                            renderType: "settlement",
                            isPending: true,
                        } satisfies  RenderEntity;
                    }
                    return null;
                }),
            ].filter(it => !!it);
        },
    });

    const dataRenderEntities = g.dataTransformer(renderEntityTransformer);

    const wasmAllEntities = g.wasmData({
        source: {
            type: "js",
            data: dataRenderEntities,
            upload: (entities: RenderEntity[]) => wasmApi.upload.uploadEntities(entities),
        },
    });

    const calculateAllChunks = g.wasmOperation({
        wasmInputs: [wasmAllTiles, wasmAllEntities],
        dataInputs: [],
        outputs: ["allChunks"],
            func: () => wasmApi.operations.calculateAllChunks(),
    });

    const wasmAllChunks = g.wasmData({
        source: {
            type: "wasm",
            operation: calculateAllChunks,
            key: "allChunks",
        },
    });

    const calculateVisibleChunks = g.wasmOperation({
        wasmInputs: [wasmAllChunks],
        dataInputs: [inputs.dataCamera],
        outputs: ["visibleChunks"],
            func: (_) => wasmApi.operations.calculateVisibleChunks(),
    });

    const wasmVisibleChunks = g.wasmData({
        source: {
            type: "wasm",
            operation: calculateVisibleChunks,
            key: "visibleChunks",
        },
    });

    const calculateTileInstances = g.wasmOperation({
        wasmInputs: [wasmVisibleChunks, wasmAllTiles],
        dataInputs: [],
        outputs: ["tileTerrainInstances", "tileFogOfWarInstances", "mapDetailVertices"],
            func: () => wasmApi.operations.calculateTileInstances(),
    });

    const wasmTileTerrainInstances = g.wasmData({
        source: {
            type: "wasm",
            operation: calculateTileInstances,
            key: "tileTerrainInstances",
        },
    });

    const wasmTileFogOfWarInstances = g.wasmData({
        source: {
            type: "wasm",
            operation: calculateTileInstances,
            key: "tileFogOfWarInstances",
        },
    });

    const wasmMapDetailVertices = g.wasmData({
        source: {
            type: "wasm",
            operation: calculateTileInstances,
            key: "mapDetailVertices",
        },
    });

    return {
        wasmVisibleChunks: wasmVisibleChunks,
        wasmTileTerrainInstances: wasmTileTerrainInstances,
        wasmTileFogOfWarInstances: wasmTileFogOfWarInstances,
        wasmMapDetailVertices: wasmMapDetailVertices,
    };
}
