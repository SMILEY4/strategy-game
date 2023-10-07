import {GLRenderer} from "../common/glRenderer";
import {Camera} from "../common/camera";
import {BaseRenderLayer} from "./baseRenderLayer";
import {GLProgram} from "../common/glProgram";
import {GLUniformType} from "../common/glTypes";
import {GLTexture} from "../common/glTexture";
import {GameStateAccess} from "../../../state/access/GameStateAccess";
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
        this.program.setUniform("u_texture", GLUniformType.SAMPLER_2D, this.tileset);
        const selectedTile = GameStateAccess.getSelectedTile();
        if (selectedTile) {
            this.program.setUniform("u_selectedTile", GLUniformType.INT_VEC2, [selectedTile.q, selectedTile.r]);
        } else {
            this.program.setUniform("u_selectedTile", GLUniformType.INT_VEC2, [-9999, -9999]);
        }
        const hoverTile = GameStateAccess.getHoverTile();
        if (hoverTile) {
            this.program.setUniform("u_hoverTile", GLUniformType.INT_VEC2, [hoverTile.q, hoverTile.r]);
        } else {
            this.program.setUniform("u_hoverTile", GLUniformType.INT_VEC2, [-9999, -9999]);
        }
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