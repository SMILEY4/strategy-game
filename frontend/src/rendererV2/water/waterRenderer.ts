import {CanvasHandle} from "../../shared/webgl/canvasHandle";
import {Camera} from "../../shared/webgl/camera";
import {RenderModule} from "../renderModule";
import {RenderData} from "../data/renderData";
import {BaseRenderer} from "../../shared/webgl/baseRenderer";
import {GLUniformType} from "../../shared/webgl/glTypes";

export class WaterRenderer implements RenderModule {

    private readonly canvasHandle: CanvasHandle;
    private renderer: BaseRenderer = null as any;

    constructor(canvasHandle: CanvasHandle) {
        this.canvasHandle = canvasHandle;
    }


    public initialize(): void {
        this.renderer = new BaseRenderer(this.canvasHandle.getGL());
    }


    public render(camera: Camera, data: RenderData) {

        data.water.program.use();
        data.water.program.setUniform("u_viewProjection", GLUniformType.MAT3, camera.getViewProjectionMatrixOrThrow());

        data.water.vertexArray.bind();
        this.renderer.drawInstanced(data.water.mesh.vertexCount, data.water.instances.instanceCount);
        data.water.vertexArray.unbind();
    }


    public dispose() {
    }


}