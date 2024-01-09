import {CanvasHandle} from "../../shared/webgl/canvasHandle";
import {Camera} from "../../shared/webgl/camera";
import {RenderModule} from "../renderModule";
import {RenderData} from "../data/renderData";
import {BaseRenderer} from "../../shared/webgl/baseRenderer";
import {GLUniformType} from "../../shared/webgl/glTypes";

export class GroundRenderer implements RenderModule {

    private readonly canvasHandle: CanvasHandle;
    private renderer: BaseRenderer = null as any;

    constructor(canvasHandle: CanvasHandle) {
        this.canvasHandle = canvasHandle;
    }


    public initialize(): void {
        this.renderer = new BaseRenderer(this.canvasHandle.getGL());
    }


    public render(camera: Camera, data: RenderData) {

        data.ground.textures.tileset.bind(0);

        data.ground.program.use();
        data.ground.program.setUniform("u_viewProjection", GLUniformType.MAT3, camera.getViewProjectionMatrixOrThrow());
        data.ground.program.setUniform("u_tileset", GLUniformType.SAMPLER_2D, data.ground.textures.tileset);

        data.ground.vertexArray.bind();
        this.renderer.drawInstanced(data.ground.mesh.vertexCount, data.ground.instances.instanceCount);
        data.ground.vertexArray.unbind();
    }


    public dispose() {
    }


}