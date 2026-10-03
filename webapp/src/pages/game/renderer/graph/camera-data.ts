import type {GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {Camera} from "@app/features/game/models/camera.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";


export function gameGraphDataCamera(g: RenderGraphBuilder, dataProvider: GameRendererDataProvider) {

    const canvasSize = g.canvasSize("camera canvas size");

    const dataCamera = g.dataExternal<VersionedContainer<Camera>>(
        prev => prev?.revId !== dataProvider.getCamera().revId,
        () => dataProvider.getCamera().load(), "camera data",
    );

    const camera = g.cameraPerspective({
        debugName: "game camera",
        renderTargetSize: canvasSize,
        up: g.dataTransformer(
            g.transform({
                inputs: [dataCamera],
                func: (camera) => [camera.data.up[0], camera.data.up[1], camera.data.up[2]],
                debugName: "camera up transform",
            }), "camera up",
        ),
        position: g.dataTransformer(
            g.transform({
                inputs: [dataCamera],
                func: (camera) => [camera.data.position[0], camera.data.position[1], camera.data.position[2]],
                debugName: "camera position transform",
            }), "camera position",
        ),
        direction: g.dataTransformer(
            g.transform({
                inputs: [dataCamera],
                func: (camera) => [camera.data.direction[0], camera.data.direction[1], camera.data.direction[2]],
                debugName: "camera direction transform",
            }), "camera direction",
        ),
        fov: g.dataTransformer(
            g.transform({
                inputs: [dataCamera],
                func: (camera) => camera.data.fov,
                debugName: "camera field of view transform",
            }), "camera field of view",
        ),
        near: g.dataTransformer(
            g.transform({
                inputs: [dataCamera],
                func: (camera) => camera.data.near,
                debugName: "camera near plane transform",
            }), "camera near plane",
        ),
        far: g.dataTransformer(
            g.transform({
                inputs: [dataCamera],
                func: (camera) => camera.data.far,
                debugName: "camera far plane transform",
            }), "camera far plane",
        ),
    });

    return {
        dataCamera: dataCamera,
        camera: camera,
    };
}
