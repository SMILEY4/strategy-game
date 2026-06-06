import {RenderGraphBuilder} from "@/modules/rendergraph/render-graph-builder.ts";
import type {GameRendererDataProvider} from "@/renderer/data/game-renderer-data-provider.ts";
import type {RenderCameraData, RenderTile} from "@/renderer/data/models.ts";
import {gameGraphChunkCulling} from "@/renderer/graph/game-graph.chunk-culling.ts";
import type {RenderGraphNode} from "@/modules/rendergraph/nodes/rg-node.ts";
import {gameGraphTileMesh} from "@/renderer/graph/game-graph.tile-mesh.ts";

import SHADER_TILEMAP_VERT from "./../shader/tilemap.vsh?raw";
import SHADER_TILEMAP_FRAG from "./../shader/tilemap.fsh?raw";
import {gameGraphTileInstances} from "@/renderer/graph/game-graph.tile-instances.ts";

export function gameGraph(dataProvider: GameRendererDataProvider): RenderGraphNode[] {

    const g = new RenderGraphBuilder();

    const canvasSize = g.canvasSize();
    const dataCamera = g.dataExternal<RenderCameraData>(() => dataProvider.getCamera(), (prev) => {
        return prev?.revId !== dataProvider.getCamera().revId
    });

    // todo could also do: tiles[] that never change + dataInputs for revIds for specific parts (mapRevId, tileDataRevId, ...)?
    const dataTilemap = g.dataExternal<RenderTile[]>(() => dataProvider.getTiles(), () => false); // todo: only change when tile indices change
    const dataTiles = g.dataExternal<RenderTile[]>(() => dataProvider.getTiles(), () => false); // todo: change when anything changes

    const dataMapRadius = g.dataExternal<number>(() => dataProvider.getMapRadius(), (prev) => prev !== dataProvider.getMapRadius());
    const dataChunkRadius = g.dataExternal<number>(() => dataProvider.getChunkRadius(), (prev) => prev !== dataProvider.getChunkRadius());

    const camera = g.cameraPerspective({
        renderTargetSize: canvasSize,
        up: g.dataTransformer(
            g.transform({
                inputs: [dataCamera],
                func: (camera) => [camera.up[0], camera.up[1], camera.up[2]],
            }),
        ),
        position: g.dataTransformer(
            g.transform({
                inputs: [dataCamera],
                func: (camera) => [camera.position[0], camera.position[1], camera.position[2]],
            }),
        ),
        direction: g.dataTransformer(
            g.transform({
                inputs: [dataCamera],
                func: (camera) => [camera.direction[0], camera.direction[1], camera.direction[2]],
            }),
        ),
        fov: g.dataTransformer(
            g.transform({
                inputs: [dataCamera],
                func: (camera) => camera.fov,
            }),
        ),
        near: g.dataTransformer(
            g.transform({
                inputs: [dataCamera],
                func: (camera) => camera.near,
            }),
        ),
        far: g.dataTransformer(
            g.transform({
                inputs: [dataCamera],
                func: (camera) => camera.far,
            }),
        ),
    });

    const {dataVisibleChunks} = gameGraphChunkCulling(g, {dataCamera, dataMapRadius, dataChunkRadius, dataTilemap, camera});
    const {tileMeshTransformer} = gameGraphTileMesh(g);
    const {tileInstanceTransformer} = gameGraphTileInstances(g, {dataTiles, dataChunks: dataVisibleChunks});

    const geometry = g.geometry({
        sources: [
            g.geometrySource({
                source: tileMeshTransformer,
                output: "mesh",
            }),
            g.geometrySource({
                source: tileInstanceTransformer,
                output: "instances",
            }),
        ],
    });

    const shader = g.shader({
        srcVertex: SHADER_TILEMAP_VERT,
        srcFragment: SHADER_TILEMAP_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    const draw = g.draw({
        shader: shader,
        geometry: geometry,
        inputs: {
            "camera": camera,
        },
    });

    g.canvas({
        renderPasses: [draw],
        depthTesting: true,
        clearColor: [0, 0, 0, 0],
    });

    return g.getNodes();
}