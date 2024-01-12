import {CanvasHandle} from "../../shared/webgl/canvasHandle";
import {Camera} from "../../shared/webgl/camera";
import {RenderModule} from "../renderModule";
import {RenderData} from "../data/renderData";
import {BaseRenderer} from "../../shared/webgl/baseRenderer";
import {GLUniformType} from "../../shared/webgl/glTypes";

export class DetailRenderer implements RenderModule {

    private readonly canvasHandle: CanvasHandle;
    private renderer: BaseRenderer = null as any;

    constructor(canvasHandle: CanvasHandle) {
        this.canvasHandle = canvasHandle;
    }


    public initialize(): void {
        this.renderer = new BaseRenderer(this.canvasHandle.getGL());
    }


    public render(camera: Camera, data: RenderData) {

        data.details.textures.tileset.bind(0)

        data.details.program.use();
        data.details.program.setUniform("u_viewProjection", GLUniformType.MAT3, camera.getViewProjectionMatrixOrThrow());
        data.details.program.setUniform("u_tileset", GLUniformType.SAMPLER_2D, data.details.textures.tileset);

        data.details.vertexArray.bind();
        this.renderer.draw(data.details.vertexCount);
        data.details.vertexArray.unbind();
    }


    public dispose() {
    }


}