import {RenderModule} from "../common/renderModule";
import {Camera} from "../../shared/webgl/camera";
import {GLRenderer} from "../../shared/webgl/glRenderer";
import {GLProgram} from "../../shared/webgl/glProgram";
import {GLTexture, GLTextureMinFilter} from "../../shared/webgl/glTexture";
import {CanvasHandle} from "../../logic/game/canvasHandle";
import {EntityRenderData} from "./entityRenderData";
import SHADER_SRC_VERT from "./shader.vsh?raw";
import SHADER_SRC_FRAG from "./shader.fsh?raw";
import {GLUniformType} from "../../shared/webgl/glTypes";

interface EntityRendererModuleData {
    renderer: GLRenderer;
    program: GLProgram;
    tileset: GLTexture,
    renderData: EntityRenderData,
}

export class EntityRenderer implements RenderModule {

    private readonly canvasHandle: CanvasHandle;
    private data: EntityRendererModuleData | null = null;

    constructor(canvasHandle: CanvasHandle) {
        this.canvasHandle = canvasHandle;
    }

    public initialize(): void {
        const gl = this.canvasHandle.getGL();
        const program = GLProgram.create(gl, SHADER_SRC_VERT, SHADER_SRC_FRAG);
        this.data = {
            program: program,
            renderer: new GLRenderer(gl),
            tileset: GLTexture.createFromPath(gl, "/tiles.png", {filterMin: GLTextureMinFilter.NEAREST}),
            renderData: new EntityRenderData(),
        };
    }

    public render(camera: Camera): void {
        if (this.data) {

            this.data.renderData.getVertexArray().bind();

            this.data.tileset.bind(0);

            this.data.program.use();
            this.data.program.setUniform("u_viewProjection", GLUniformType.MAT3, camera.getViewProjectionMatrixOrThrow());

            this.data.renderer.draw(this.data.renderData.getVertexCount());

            this.data.renderData.getVertexArray().unbind();


        }
    }

    public dispose(): void {
        if (this.data) {
            this.data.program.dispose();
            this.data.tileset.dispose();
        }
    }

}