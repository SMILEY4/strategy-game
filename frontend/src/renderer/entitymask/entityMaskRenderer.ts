import {RenderModule} from "../renderModule";
import {Camera} from "../../shared/webgl/camera";
import {BaseRenderer} from "../../shared/webgl/baseRenderer";
import {CanvasHandle} from "../../shared/webgl/canvasHandle";
import {RenderData} from "../data/renderData";
import {GLUniformType} from "../../shared/webgl/glTypes";

export class EntityMaskRenderer implements RenderModule {

    private readonly canvasHandle: CanvasHandle;
    private renderer: BaseRenderer = null as any;

    constructor(canvasHandle: CanvasHandle) {
        this.canvasHandle = canvasHandle;
    }


    public initialize(): void {
        this.renderer = new BaseRenderer(this.canvasHandle.getGL());
    }


    public render(camera: Camera, data: RenderData): void {

        data.entityMask.textures.mask.bind(0);

        data.entityMask.program.use();
        data.entityMask.program.setUniform("u_viewProjection", GLUniformType.MAT3, camera.getViewProjectionMatrixOrThrow());
        data.entityMask.program.setUniform("u_tileset", GLUniformType.SAMPLER_2D, data.entityMask.textures.mask);

        data.entityMask.framebuffer.bind()
        data.entityMask.framebuffer.resize(camera.getWidth(), camera.getHeight())


        data.entityMask.vertexArray.bind();
        this.renderer.prepareFrame(camera, [1, 1, 1, 1])
        this.renderer.draw(data.entities.vertexCount);
        data.entityMask.vertexArray.unbind();

        data.entityMask.framebuffer.unbind()
    }


    public dispose() {
    }

}