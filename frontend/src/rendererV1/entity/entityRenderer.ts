import {RenderModule} from "../renderModule";
import {Camera} from "../../shared/webgl/camera";
import {BaseRenderer} from "../../shared/webgl/baseRenderer";
import {CanvasHandle} from "../../shared/webgl/canvasHandle";
import {RenderData} from "../data/renderData";
import {GLUniformType} from "../../shared/webgl/glTypes";

export class EntityRenderer implements RenderModule {

    private readonly canvasHandle: CanvasHandle;
    private renderer: BaseRenderer = null as any;

    constructor(canvasHandle: CanvasHandle) {
        this.canvasHandle = canvasHandle;
    }


    public initialize(): void {
        this.renderer = new BaseRenderer(this.canvasHandle.getGL());
    }


    public render(camera: Camera, data: RenderData): void {

        data.entities.textures.tileset.bind(0);

        data.entities.program.use();
        data.entities.program.setUniform("u_grayscaleMode", GLUniformType.BOOL, data.meta.grayscale);
        data.entities.program.setUniform("u_viewProjection", GLUniformType.MAT3, camera.getViewProjectionMatrixOrThrow());
        data.entities.program.setUniform("u_tileset", GLUniformType.SAMPLER_2D, data.entities.textures.tileset);

        data.entities.vertexArray.bind();
        this.renderer.draw(data.entities.vertexCount);
        data.entities.vertexArray.unbind();
    }


    public dispose() {
    }

}