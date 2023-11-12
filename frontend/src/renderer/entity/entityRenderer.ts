import {RenderModule} from "../common/renderModule";
import {Camera} from "../../shared/webgl/camera";
import {GLRenderer} from "../../shared/webgl/glRenderer";
import {CanvasHandle} from "../../logic/game/canvasHandle";
import {RenderData} from "../data/renderData";
import {GLUniformType} from "../../shared/webgl/glTypes";

export class EntityRenderer implements RenderModule {

    private readonly canvasHandle: CanvasHandle;
    private renderer: GLRenderer = null as any;

    constructor(canvasHandle: CanvasHandle) {
        this.canvasHandle = canvasHandle;
    }

    public render(camera: Camera, data: RenderData): void {

        data.entities.textures.tileset.bind(0);

        data.entities.program.use();
        data.entities.program.setUniform("u_viewProjection", GLUniformType.MAT3, camera.getViewProjectionMatrixOrThrow());
        data.entities.program.setUniform("u_tileset", GLUniformType.SAMPLER_2D, data.entities.textures.tileset);

        data.entities.vertexArray.bind();
        this.renderer.draw(data.entities.vertexCount);
        data.entities.vertexArray.unbind();
    }


    public initialize(): void {
        this.renderer = new GLRenderer(this.canvasHandle.getGL());
    }


    public dispose() {
    }

}