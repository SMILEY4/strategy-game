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

        data.world.framebuffer.bindTexture(0)
        data.overlay.textures.paper.bind(1)
        data.overlay.textures.noise.bind(2)
        data.overlay.textures.noisePainted.bind(3)

        data.overlay.program.use();
        data.overlay.program.setUniform("u_viewProjection", GLUniformType.MAT3, camera.getViewProjectionMatrixOrThrow());
        data.overlay.program.setUniform("u_screenSize", GLUniformType.VEC2, [camera.getWidth(), camera.getHeight()]);
        data.overlay.program.setUniform("u_selectedTile", GLUniformType.INT_VEC2, data.meta.tileSelected ?? [-9999, -9999]);
        data.overlay.program.setUniform("u_hoverTile", GLUniformType.INT_VEC2, data.meta.tileMouseOver ?? [-9999, -9999]);
        data.overlay.program.setUniform("u_world", GLUniformType.SAMPLER_2D, data.world.framebuffer);
        data.overlay.program.setUniform("u_paper", GLUniformType.SAMPLER_2D, data.overlay.textures.paper);
        data.overlay.program.setUniform("u_noise", GLUniformType.SAMPLER_2D, data.overlay.textures.noise);
        data.overlay.program.setUniform("u_noisePainted", GLUniformType.SAMPLER_2D, data.overlay.textures.noisePainted);

        data.overlay.vertexArray.bind();
        this.renderer.drawInstanced(data.overlay.mesh.vertexCount, data.overlay.instances.instanceCount);
        data.overlay.vertexArray.unbind();
    }


    public dispose() {
    }


}