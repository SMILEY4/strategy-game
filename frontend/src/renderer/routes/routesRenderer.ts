import {RenderModule} from "../renderModule";
import {Camera} from "../../shared/webgl/camera";
import {GLRenderer} from "../../shared/webgl/glRenderer";
import {CanvasHandle} from "../../logic/game/canvasHandle";
import {RenderData} from "../data/renderData";
import {GLUniformType} from "../../shared/webgl/glTypes";

export class RoutesRenderer implements RenderModule {

    private readonly canvasHandle: CanvasHandle;
    private renderer: GLRenderer = null as any;

    constructor(canvasHandle: CanvasHandle) {
        this.canvasHandle = canvasHandle;
    }


    public initialize(): void {
        this.renderer = new GLRenderer(this.canvasHandle.getGL());
    }


    public render(camera: Camera, data: RenderData): void {

        data.routes.texture.bind(0);

        data.routes.program.use();
        data.routes.program.setUniform("u_viewProjection", GLUniformType.MAT3, camera.getViewProjectionMatrixOrThrow());
        data.routes.program.setUniform("u_texture", GLUniformType.SAMPLER_2D, data.routes.texture);

        data.routes.framebuffer.bind()
        data.routes.framebuffer.resize(camera.getWidth(), camera.getHeight())

        data.routes.vertexArray.bind();
        this.renderer.prepareFrame(camera, [0, 0, 0, 0])
        this.renderer.draw(data.routes.vertexCount);
        data.routes.vertexArray.unbind();

        data.routes.framebuffer.unbind()
    }


    public dispose() {
    }

}