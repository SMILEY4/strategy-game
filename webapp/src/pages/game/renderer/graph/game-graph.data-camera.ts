import type {GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {Camera} from "@app/features/game/models/camera.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";


export function gameGraphDataCamera(g: RenderGraphBuilder, dataProvider: GameRendererDataProvider) {

    const canvasSize = g.canvasSize();

    const dataCamera = g.dataExternal<VersionedContainer<Camera>>(
        prev => prev?.revId !== dataProvider.getCamera().revId,
        () => dataProvider.getCamera().load(),
    );

    const camera = g.cameraPerspective({
        renderTargetSize: canvasSize,
        up: g.dataTransformer(
            g.transform({
                inputs: [dataCamera],
                func: (camera) => [camera.data.up[0], camera.data.up[1], camera.data.up[2]],
            }),
        ),
        position: g.dataTransformer(
            g.transform({
                inputs: [dataCamera],
                func: (camera) => [camera.data.position[0], camera.data.position[1], camera.data.position[2]],
            }),
        ),
        direction: g.dataTransformer(
            g.transform({
                inputs: [dataCamera],
                func: (camera) => [camera.data.direction[0], camera.data.direction[1], camera.data.direction[2]],
            }),
        ),
        fov: g.dataTransformer(
            g.transform({
                inputs: [dataCamera],
                func: (camera) => camera.data.fov,
            }),
        ),
        near: g.dataTransformer(
            g.transform({
                inputs: [dataCamera],
                func: (camera) => camera.data.near,
            }),
        ),
        far: g.dataTransformer(
            g.transform({
                inputs: [dataCamera],
                func: (camera) => camera.data.far,
            }),
        ),
    });

    return {
        dataCamera: dataCamera,
        camera: camera,
    };
}