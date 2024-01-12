import {CanvasHandle} from "../../shared/webgl/canvasHandle";
import {Camera} from "../../shared/webgl/camera";
import {RenderModule} from "../renderModule";
import {RenderData} from "../data/renderData";
import {BaseRenderer} from "../../shared/webgl/baseRenderer";
import {GLUniformType} from "../../shared/webgl/glTypes";

export class OverlayRenderer implements RenderModule {

    private readonly canvasHandle: CanvasHandle;
    private renderer: BaseRenderer = null as any;

    constructor(canvasHandle: CanvasHandle) {
        this.canvasHandle = canvasHandle;
    }


    public initialize(): void {
        this.renderer = new BaseRenderer(this.canvasHandle.getGL());
    }


    public render(camera: Camera, data: RenderData) {
        data.overlay.program.use();
        data.overlay.program.setUniform("u_viewProjection", GLUniformType.MAT3, camera.getViewProjectionMatrixOrThrow());

        data.overlay.program.setUniform("u_selectedTile", GLUniformType.INT_VEC2, data.meta.tileSelected ?? [-9999, -9999]);
        data.overlay.program.setUniform("u_hoverTile", GLUniformType.INT_VEC2, data.meta.tileMouseOver ?? [-9999, -9999]);

        data.overlay.vertexArray.bind();
        this.renderer.drawInstanced(data.overlay.mesh.vertexCount, data.overlay.instances.instanceCount);
        data.overlay.vertexArray.unbind();
    }


    public dispose() {
    }


}