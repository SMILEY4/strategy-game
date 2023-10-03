import {GLRenderer} from "../common/glRenderer";
import {Camera} from "../common/camera";
import {BaseRenderLayer} from "./baseRenderLayer";
import {GLProgram} from "../common/glProgram";
import {GLUniformType} from "../common/glTypes";
import GLProgramAttribute = GLProgram.GLProgramAttribute;
import {GLTexture} from "../common/glTexture";

export class TerrainRenderLayer extends BaseRenderLayer {

    private readonly program: GLProgram;
    private readonly tileset: GLTexture;

    constructor(program: GLProgram, tileset: GLTexture) {
        super();
        this.program = program;
        this.tileset = tileset;
    }

    public render(camera: Camera, renderer: GLRenderer): void {
        this.tileset.bind(0);
        this.program.use();
        this.program.setUniform("u_viewProjection", GLUniformType.MAT3, camera.getViewProjectionMatrixOrThrow());
        this.program.setUniform("u_texture", GLUniformType.SAMPLER_2D, this.tileset);
        this.getChunks().forEach(chunk => {
            chunk.getVertexArray().bind();
            renderer.drawMesh(chunk.getMeshSize());
        });
    }

    public dispose(): void {
        super.dispose();
        this.program.dispose();
    }

    public getShaderAttributes(): GLProgramAttribute[] {
        return this.program.getInformation().attributes;
    }

}