import type {GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {CommandCollection, EntityCollection, RenderCamera, RenderEntity, TileCollection} from "@pages/game/renderer/data/models.ts";
import type {GameGraphWasmApi} from "@pages/game/renderer/game-graph.wasm-api.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import {EntityUtils} from "@app/features/game/models/entity.ts";


export function gameGraphDataWorld(
    g: RenderGraphBuilder,
    dataProvider: GameRendererDataProvider,
    wasmApi: GameGraphWasmApi,
    inputs: {
        dataCamera: DataRenderGraphNode<RenderCamera>
    },
) {

    const dataAllTiles = g.dataExternal<TileCollection>(
        () => dataProvider.getTiles(),
        prev => prev?.revId !== dataProvider.getTilesRevId(),
    );

    const wasmAllTiles = g.wasmData({
        source: {
            type: "js",
            data: dataAllTiles,
            upload: (tiles: TileCollection) => wasmApi.uploadTiles(tiles.tiles),
        },
    });

    const dataAllEntities = g.dataExternal<EntityCollection>(
        () => dataProvider.getEntities(),
        prev => prev?.revId !== dataProvider.getEntitiesRevId(),
    );

    const dataAllCommands = g.dataExternal<CommandCollection>(
        () => dataProvider.getCommands(),
        prev => prev?.revId !== dataProvider.getCommandsRevId(),
    );

    const renderEntityTransformer = g.transform<[EntityCollection, CommandCollection], RenderEntity[]>({
        inputs: [dataAllEntities, dataAllCommands],
        func: (entities, commands) => {
            return [
                ...entities.entities.map(entity => {
                    if(EntityUtils.hasComponent(entity, "settlement")) {
                        return {
                            ...entity,
                            renderType: "settlement",
                            isPending: false,
                        } satisfies RenderEntity
                    }
                    return null;
                }),
                ...commands.commands.map(command => {
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
            upload: (entities: RenderEntity[]) => wasmApi.uploadEntities(entities),
        },
    });

    const collectChunks = g.wasmOperation({
        wasmInputs: [wasmAllTiles, wasmAllEntities],
        dataInputs: [],
        outputs: ["allChunks"],
        func: () => wasmApi.collectChunks(),
    });

    const wasmAllChunks = g.wasmData({
        source: {
            type: "wasm",
            operation: collectChunks,
            key: "allChunks",
        },
    });

    const cullChunks = g.wasmOperation({
        wasmInputs: [wasmAllChunks],
        dataInputs: [inputs.dataCamera],
        outputs: ["visibleChunks"],
        func: (_camera: RenderCamera) => wasmApi.cullChunks(),
    });

    const wasmVisibleChunks = g.wasmData({
        source: {
            type: "wasm",
            operation: cullChunks,
            key: "visibleChunks",
        },
    });

    const buildTileInstances = g.wasmOperation({
        wasmInputs: [wasmVisibleChunks, wasmAllTiles],
        dataInputs: [],
        outputs: ["tileTerrainInstances", "tileFogOfWarInstances", "mapDetailVertices"],
        func: () => wasmApi.buildTileInstances(),
    });

    const wasmTileTerrainInstances = g.wasmData({
        source: {
            type: "wasm",
            operation: buildTileInstances,
            key: "tileTerrainInstances",
        },
    });

    const wasmTileFogOfWarInstances = g.wasmData({
        source: {
            type: "wasm",
            operation: buildTileInstances,
            key: "tileFogOfWarInstances",
        },
    });

    const wasmMapDetailVertices = g.wasmData({
        source: {
            type: "wasm",
            operation: buildTileInstances,
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
