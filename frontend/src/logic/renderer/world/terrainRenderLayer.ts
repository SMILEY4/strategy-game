import {GLRenderer} from "../common/glRenderer";
import {Camera} from "../common/camera";
import {BaseRenderLayer} from "./baseRenderLayer";
import {GLTexture} from "../common/glTexture";
import {GLProgram} from "../common2/glProgram";
import {GLUniformType} from "../common2/glTypes";
import GLProgramAttribute = GLProgram.GLProgramAttribute;

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
        this.program.setUniform("u_texture", GLUniformType.SAMPLER_2D, this.tileset.getLastTextureUnit());
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