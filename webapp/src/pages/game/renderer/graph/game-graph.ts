import type {GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {GameGraphWasmApi} from "@pages/game/renderer/graph/game-graph.wasm-api.ts";
import {gameGraphPassCoastline} from "@pages/game/renderer/graph/game-graph.pass-coastline.ts";
import {gameGraphPassTerrain} from "@pages/game/renderer/graph/game-graph.pass-terrain.ts";
import {gameGraphPassCompose} from "@pages/game/renderer/graph/game-graph.pass-compose.ts";
import {gameGraphDataTiles} from "@pages/game/renderer/graph/game-graph.data-tiles.ts";
import {gameGraphDataCamera} from "@pages/game/renderer/graph/game-graph.data-camera.ts";
import {gameGraphPassFogOfWar} from "@pages/game/renderer/graph/game-graph.pass-fog-of-war.ts";


export function gameGraph(g: RenderGraphBuilder, dataProvider: GameRendererDataProvider, wasmApi: GameGraphWasmApi) {

    const {dataCamera, camera} = gameGraphDataCamera(g, dataProvider);

    const {wasmTileTerrainInstances, wasmTileFogOfWarInstances} = gameGraphDataTiles(g, dataProvider, wasmApi, {
        dataCamera: dataCamera,
    });

    const {layerBaseTerrain} = gameGraphPassTerrain(g, wasmApi, {
        wasmTileInstances: wasmTileTerrainInstances,
        camera: camera,
    });

    const {layerCoastlineMask} = gameGraphPassCoastline(g, wasmApi, {
        wasmTileInstances: wasmTileTerrainInstances,
        camera: camera,
    });

    const { layerFogOfWar} = gameGraphPassFogOfWar(g, wasmApi, {
        wasmTileInstances: wasmTileFogOfWarInstances,
        camera: camera,
    })

    const {drawCompose} = gameGraphPassCompose(g, {
        layerBaseTerrain: layerBaseTerrain,
        layerCoastlineMask: layerCoastlineMask,
        layerFogOfWar: layerFogOfWar,
    });

    g.canvas({
        renderPasses: [drawCompose],
        depthTesting: false,
        clearColor: [0, 0, 0, 1],
    });

    console.log(g.getNodes())

    return g.getNodes();
}