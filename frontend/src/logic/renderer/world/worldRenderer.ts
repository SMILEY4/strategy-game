import {RenderWorld} from "./renderWorld";
import {GLRenderer} from "../common/glRenderer";
import {Camera} from "../common/camera";

export class WorldRenderer {

    private readonly renderer: GLRenderer;

    constructor(renderer: GLRenderer) {
        this.renderer = renderer;
    }

    public render(world: RenderWorld, camera: Camera) {
        this.renderer.prepareFrame();
        world.getLayers().forEach(layer => {
            layer.render(camera, this.renderer);
        });
    }

    public dispose() {
        // nothing to do
    }

}