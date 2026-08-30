import type {GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {GameGraphWasmApi} from "@pages/game/renderer/game-graph.wasm-api.ts";
import {gameGraphPassCoastline} from "@pages/game/renderer/graph/game-graph.pass-coastline.ts";
import {gameGraphPassTerrain} from "@pages/game/renderer/graph/game-graph.pass-terrain.ts";
import {gameGraphPassCompose} from "@pages/game/renderer/graph/game-graph.pass-compose.ts";
import {gameGraphDataWorld} from "@pages/game/renderer/graph/game-graph.data-world.ts";
import {gameGraphDataCamera} from "@pages/game/renderer/graph/game-graph.data-camera.ts";
import {gameGraphPassFogOfWar} from "@pages/game/renderer/graph/game-graph.pass-fog-of-war.ts";
import type {DebugData} from "@app/features/game/database/debug.database.ts";
import {gameGraphPassSelectedTile} from "@pages/game/renderer/graph/game-graph.pass-selected-tile.ts";
import {gameGraphPassMapDetails} from "@pages/game/renderer/graph/game-graph.pass-map-details.ts";
import {gameGraphHtml} from "@pages/game/renderer/graph/game-graph.html.ts";
import {gameGraphPassOverlay} from "@pages/game/renderer/graph/game-graph.overlay.ts";


export function gameGraph(g: RenderGraphBuilder, dataProvider: GameRendererDataProvider, wasmApi: GameGraphWasmApi) {

    const dataDebug = g.dataExternal<DebugData & { revId: string }>(() => dataProvider.getDebugData(), (prev) => {
        return prev?.revId !== dataProvider.getDebugData().revId;
    });

    const dataPointerWorld = g.dataExternal<[number, number]>(() => dataProvider.getPointerWorldPosition(), (prev => {
        return prev[0] !== dataProvider.getPointerWorldPosition()[0] || prev[1] !== dataProvider.getPointerWorldPosition()[1]
    }))

    const dataPointerHex = g.dataExternal<[number, number]>(() => dataProvider.getPointerHexPosition(), (prev => {
        return prev[0] !== dataProvider.getPointerHexPosition()[0] || prev[1] !== dataProvider.getPointerHexPosition()[1]
    }))

    const {dataCamera, camera} = gameGraphDataCamera(g, dataProvider);

    const {wasmTileTerrainInstances, wasmTileFogOfWarInstances, wasmMapDetailVertices} = gameGraphDataWorld(g, dataProvider, wasmApi, {
        dataCamera: dataCamera,
    });

    const {layerBaseTerrain} = gameGraphPassTerrain(g, wasmApi, {
        wasmTileInstances: wasmTileTerrainInstances,
        camera: camera,
        dataDebug: dataDebug,
    });

    const {layerCoastlineMask} = gameGraphPassCoastline(g, wasmApi, {
        wasmTileInstances: wasmTileTerrainInstances,
        camera: camera,
        dataDebug: dataDebug,
    });

    const {layerFogOfWar} = gameGraphPassFogOfWar(g, wasmApi, {
        wasmTileInstances: wasmTileFogOfWarInstances,
        camera: camera,
        dataDebug: dataDebug,
    });

    const {layerMapDetails} = gameGraphPassMapDetails(g, wasmApi, {
        wasmMapDetailVertices: wasmMapDetailVertices,
        cameraData: dataCamera,
        camera: camera,
        dataDebug: dataDebug,
    });

    const {layerOverlay} = gameGraphPassOverlay(g, wasmApi, {
        camera: camera,
        dataPointerHex: dataPointerHex,
        dataPointerWorld: dataPointerWorld,
        dataDebug: dataDebug
    });

    const {drawCompose} = gameGraphPassCompose(g, {
        layerBaseTerrain: layerBaseTerrain,
        layerCoastlineMask: layerCoastlineMask,
        layerFogOfWar: layerFogOfWar,
        layerMapDetails: layerMapDetails,
        layerOverlay: layerOverlay,
        dataDebug: dataDebug,
    });

    const {drawSelectedTile} = gameGraphPassSelectedTile(g, dataProvider, {
        camera: camera,
        dataDebug: dataDebug,
    });

    const {htmlDraw} = gameGraphHtml(g, dataProvider, {
        dataCamera: dataCamera,
    });

    g.canvas({
        renderPasses: [drawCompose, drawSelectedTile],
        depthTesting: false,
        clearColor: [0, 0, 0, 1],
    });

    g.htmlContainer({
        elementId: "game-overlay",
        renderPasses: [htmlDraw],
    });

    console.log("RG_NODES", g.getNodes())

    return g.getNodes();
}