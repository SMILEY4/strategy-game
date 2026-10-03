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
import type {Route} from "@app/features/game/models/route.ts";


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
        () => dataProvider.getTiles().load(), "all tiles",
    );

    const wasmAllTiles = g.wasmData({
        debugName: "WASM all tiles",
        source: {
            type: "js",
            data: dataAllTiles,
            upload: (tiles: VersionedContainer<Tile[]>) => wasmApi.upload.uploadTiles(tiles.data),
        },
    });

    const dataAllEntities = g.dataExternal<VersionedContainer<Entity[]>>(
        prev => prev?.revId !== dataProvider.getEntities().revId,
        () => dataProvider.getEntities().load(), "all entities",
    );

    const dataAllCommands = g.dataExternal<VersionedContainer<Command[]>>(
        prev => prev?.revId !== dataProvider.getCommands().revId,
        () => dataProvider.getCommands().load(), "all commands",
    );

    const renderEntityTransformer = g.transform<[VersionedContainer<Entity[]>, VersionedContainer<Command[]>], RenderEntity[]>({
        debugName: "render entities",
        inputs: [dataAllEntities, dataAllCommands],
        func: (entities, commands) => {
            return [
                ...entities.data.map(entity => {
                    const tileImprovement = EntityUtils.getComponent(entity, "tile-improvement");
                    if (tileImprovement) {
                        return {
                            ...entity,
                            renderType: "tile-improvement",
                            isPending: false,
                            tileImprovementType: tileImprovement.key,
                        } satisfies RenderEntity;
                    }
                    if (EntityUtils.hasComponent(entity, "settlement")) {
                        return {
                            ...entity,
                            renderType: "settlement",
                            isPending: false,
                            tileImprovementType: null,
                        } satisfies RenderEntity;
                    }
                    return null;
                }),
                ...commands.data.map(command => {
                    if(command.type === "create-tile-improvement") {
                        return {
                            id: 0,
                            owner: null,
                            position: command.location,
                            renderType: "tile-improvement",
                            isPending: true,
                            tileImprovementType: command.improvementKey,
                        } satisfies  RenderEntity;
                    }
                    if (command.type === "create-settlement") {
                        return {
                            id: 0,
                            owner: null,
                            position: command.location,
                            renderType: "settlement",
                            isPending: true,
                            tileImprovementType: null,
                        } satisfies  RenderEntity;
                    }
                    return null;
                }),
            ].filter(it => !!it);
        },
    });

    const dataRenderEntities = g.dataTransformer(renderEntityTransformer, "render entities data");

    const wasmAllEntities = g.wasmData({
        debugName: "WASM all render entities",
        source: {
            type: "js",
            data: dataRenderEntities,
            upload: (entities: RenderEntity[]) => wasmApi.upload.uploadEntities(entities),
        },
    });

    const dataAllRoutes = g.dataExternal<VersionedContainer<Route[]>>(
        prev => prev?.revId !== dataProvider.getRoutes().revId,
        () => dataProvider.getRoutes().load(), "all routes",
    );

    const wasmAllRoutes = g.wasmData({
        debugName: "WASM all routes",
        source: {
            type: "js",
            data: dataAllRoutes,
            upload: (routes: VersionedContainer<Route[]>) => wasmApi.upload.uploadRoutes(routes.data),
        },
    });

    const calculateAllChunks = g.wasmOperation({
        debugName: "calculate all chunks",
        wasmInputs: [wasmAllTiles, wasmAllEntities],
        dataInputs: [],
        outputs: ["allChunks"],
            func: () => wasmApi.operations.calculateAllChunks(),
    });

    const wasmAllChunks = g.wasmData({
        debugName: "WASM all chunks",
        source: {
            type: "wasm",
            operation: calculateAllChunks,
            key: "allChunks",
        },
    });

    const calculateVisibleChunks = g.wasmOperation({
        debugName: "calculate visible chunks",
        wasmInputs: [wasmAllChunks],
        dataInputs: [inputs.dataCamera],
        outputs: ["visibleChunks"],
            func: (_) => wasmApi.operations.calculateVisibleChunks(),
    });

    const wasmVisibleChunks = g.wasmData({
        debugName: "WASM visible chunks",
        source: {
            type: "wasm",
            operation: calculateVisibleChunks,
            key: "visibleChunks",
        },
    });

    const calculateWorldMesh = g.wasmOperation({
        debugName: "calculate world mesh",
        wasmInputs: [wasmVisibleChunks, wasmAllTiles, wasmAllRoutes],
        dataInputs: [],
        outputs: ["tileLandInstances", "tileWaterInstances", "waterEdgeInstances", "tileFogOfWarInstances", "mapDetailVertices", "routeVertices"],
            func: () => wasmApi.operations.calculateWorldMesh(),
    });

    const wasmTileLandInstances = g.wasmData({
        debugName: "WASM tile land instances",
        source: {
            type: "wasm",
            operation: calculateWorldMesh,
            key: "tileLandInstances",
        },
    });

    const wasmTileWaterInstances = g.wasmData({
        debugName: "WASM tile water instances",
        source: {
            type: "wasm",
            operation: calculateWorldMesh,
            key: "tileWaterInstances",
        },
    });

    const wasmWaterEdgeInstances = g.wasmData({
        debugName: "WASM water edge instances",
        source: {
            type: "wasm",
            operation: calculateWorldMesh,
            key: "waterEdgeInstances",
        },
    });

    const wasmTileFogOfWarInstances = g.wasmData({
        debugName: "WASM tile fog of war instances",
        source: {
            type: "wasm",
            operation: calculateWorldMesh,
            key: "tileFogOfWarInstances",
        },
    });

    const wasmMapDetailVertices = g.wasmData({
        debugName: "WASM map detail vertices",
        source: {
            type: "wasm",
            operation: calculateWorldMesh,
            key: "mapDetailVertices",
        },
    });


    const wasmRouteVertices = g.wasmData({
        debugName: "WASM route vertices",
        source: {
            type: "wasm",
            operation: calculateWorldMesh,
            key: "routeVertices",
        },
    });

    return {
        wasmVisibleChunks: wasmVisibleChunks,
        warmTileLandInstances: wasmTileLandInstances,
        wasmTileWaterInstances: wasmTileWaterInstances,
        wasmWaterEdgeInstances: wasmWaterEdgeInstances,
        wasmTileFogOfWarInstances: wasmTileFogOfWarInstances,
        wasmMapDetailVertices: wasmMapDetailVertices,
        wasmRouteVertices: wasmRouteVertices,
    };
}
