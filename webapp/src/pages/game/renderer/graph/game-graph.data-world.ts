import type {GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {EntityCollection, RenderCamera, TileCollection} from "@pages/game/renderer/data/models.ts";
import type {GameGraphWasmApi} from "@pages/game/renderer/game-graph.wasm-api.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";


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
        prev => prev?.revId !== dataProvider.getTilesRevId()
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

    const wasmAllEntities = g.wasmData({
        source: {
            type: "js",
            data: dataAllEntities,
            upload: (entities: EntityCollection) => wasmApi.uploadEntities(entities.entities),
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
        outputs: ["tileTerrainInstances", "tileFogOfWarInstances", "mapDetailVertices",],
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
        wasmTileTerrainInstances: wasmTileTerrainInstances,
        wasmTileFogOfWarInstances: wasmTileFogOfWarInstances,
        wasmMapDetailVertices: wasmMapDetailVertices
    };
}