import type {GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {RenderWasmApi} from "@pages/game/renderer/wasm/render-wasm-api.ts";
import {gameGraphDataCamera} from "@pages/game/renderer/graph/camera-data.ts";
import {gameGraphDataWorld} from "@pages/game/renderer/graph/world-data.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";
import type {DeveloperSettings} from "@app/features/game/database/developer-settings.database.ts";
import {GLColorStoreFormat} from "@modules/rendergraph/webgl/gl-texture-attachment.ts";
import {debugVisRendertarget} from "@pages/game/renderer/graph/utils/debug-rendertarget.ts";
import type {PointerPosition} from "@app/features/game/database/pointer-position.database.ts";
import {renderPassWorld} from "@pages/game/renderer/graph/world/render-pass.world.ts";
import {renderWorldPostProcess} from "@pages/game/renderer/graph/world/render.world-post-process.ts";
import {renderTileHighlight} from "@pages/game/renderer/graph/overlay/render.tile-highlight.ts";
import {renderOverlay} from "@pages/game/renderer/graph/overlay/render.overlay.ts";
import {renderTileGrid} from "@pages/game/renderer/graph/overlay/render.tile-grid.ts";
import {gameGraphHtml} from "@pages/game/renderer/graph/html.ts";

export function gameGraph(g: RenderGraphBuilder, dataProvider: GameRendererDataProvider, wasmApi: RenderWasmApi) {

    const dataDeveloperSettings = g.dataExternal<VersionedContainer<DeveloperSettings>>(
        (prev) => prev?.revId !== dataProvider.getDeveloperSettings().revId,
        () => dataProvider.getDeveloperSettings().load(), "developer settings",
    );

    const {dataCamera, camera} = gameGraphDataCamera(g, dataProvider);

    const dataPointerPosition = g.dataExternal<VersionedContainer<PointerPosition>>(
        prev => prev?.revId !== dataProvider.getPointerPosition().revId,
        () => dataProvider.getPointerPosition().load(),
        "pointer position",
    );

    const dataPointerHexPosition = g.dataTransformer(
        g.transform({
            inputs: [dataPointerPosition],
            func: (data) => data.data.hex,
            debugName: "pointer hex position",
        }),
    );

    const dataPointerWorldPosition = g.dataTransformer(
        g.transform({
            inputs: [dataPointerPosition],
            func: (data) => data.data.world,
            debugName: "pointer world position",
        }),
    );

    const {
        wasmVisibleChunks,
        wasmTileFogOfWarInstances,
        warmTileLandInstances,
        wasmTileWaterInstances,
        wasmWaterEdgeInstances,
        wasmMapDetailVertices,
        wasmRouteVertices,
    } = gameGraphDataWorld(g, dataProvider, wasmApi, {
        dataCamera: dataCamera,
    });

    const renderTargetWorld = renderPassWorld(g, wasmApi, {
        dataDeveloperSettings: dataDeveloperSettings,
        camera: camera,
        cameraData: dataCamera,
        wasmWaterEdgeInstances: wasmWaterEdgeInstances,
        warmTileLandInstances: warmTileLandInstances,
        wasmTileFogOfWarInstances: wasmTileFogOfWarInstances,
        wasmTileWaterInstances: wasmTileWaterInstances,
        wasmMapDetailVertices: wasmMapDetailVertices,
        wasmRouteVertices: wasmRouteVertices,
    });

    const {drawWorldPostProcess} = renderWorldPostProcess(g, dataProvider, {
        dataDeveloperSettings: dataDeveloperSettings,
        camera: camera,
        dataPointerHexPosition: dataPointerHexPosition,
        world: renderTargetWorld,
    });

    const {drawTileHighlightsFront, drawTileHighlightsBack} = renderTileHighlight(g, dataProvider, {
        dataDeveloperSettings: dataDeveloperSettings,
        camera: camera,
        dataPointerHexPosition: dataPointerHexPosition,
    });

    const {
        drawOverlayFill,
        drawOverlayBorderBack,
        drawOverlayBorderFront,
        drawRouteHighlight,
    } = renderOverlay(g, dataProvider, wasmApi, {
        dataDeveloperSettings: dataDeveloperSettings,
        camera: camera,
        visibleChunks: wasmVisibleChunks,
    });

    const {drawTileGrid} = renderTileGrid(g, wasmApi, {
        camera: camera,
        dataDeveloperSettings: dataDeveloperSettings,
        dataPointerWorldPosition: dataPointerWorldPosition,
        dataPointerHexPosition: dataPointerHexPosition,
    });

    const renderTargetWorldCombined = g.rendertarget({
        debugName: "world combined render target",
        size: g.canvasSize("world combined canvas size"),
        sizeScale: g.dataConst(1, "world combined scale"),
        attachments: {
            color: {
                type: "color",
                format: GLColorStoreFormat.RGBA_16F,
            },
            depth: {
                type: "ref",
                source: renderTargetWorld,
                sourceAttachmentName: "depth",
            },
        },
        renderPasses: [
            drawWorldPostProcess,

            drawOverlayFill,
            drawOverlayBorderBack,
            drawOverlayBorderFront,

            drawRouteHighlight,

            drawTileGrid,
            drawTileHighlightsFront,
            drawTileHighlightsBack,
        ],
        clearColor: [0, 0, 0, 0],
    });

    const drawDebugVis = debugVisRendertarget(g, renderTargetWorldCombined);

    g.canvas({
        debugName: "game canvas",
        renderPasses: [drawDebugVis],
        clearColor: [0, 0, 0, 1],
    });

    const {htmlDraw} = gameGraphHtml(g, dataProvider, {
        dataCamera: dataCamera,
    });

    g.htmlContainer({
        debugName: "game HTML overlay",
        elementId: "game-overlay",
        renderPasses: [htmlDraw],
    });

    return g.getNodes();
}
