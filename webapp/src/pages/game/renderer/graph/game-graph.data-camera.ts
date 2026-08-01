import type {GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {RenderCamera} from "@pages/game/renderer/data/models.ts";


export function gameGraphDataCamera(g: RenderGraphBuilder, dataProvider: GameRendererDataProvider) {

    const canvasSize = g.canvasSize();

    const dataCamera = g.dataExternal<RenderCamera>(() => dataProvider.getCamera(), (prev) => {
        return prev?.revId !== dataProvider.getCameraRevId();
    });

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

    return {
        dataCamera: dataCamera,
        camera: camera,
    };
}