import {GLProgram} from "../common/glProgram";
import {GLRenderer} from "../common/glRenderer";
import {ProgramMetadata} from "../common/programMetadata";
import {Camera} from "../common/camera";
import {BaseRenderLayer} from "./baseRenderLayer";
import {GLTexture} from "../common/glTexture";

export class TerrainRenderLayer extends BaseRenderLayer {

    private readonly program: GLProgram;
    private readonly programMeta: ProgramMetadata;
    private readonly tileset: GLTexture;

    constructor(program: GLProgram, programMeta: ProgramMetadata, tileset: GLTexture) {
        super();
        this.program = program;
        this.programMeta = programMeta;
        this.tileset = tileset;
    }

    public render(camera: Camera, renderer: GLRenderer): void {
        this.tileset.bind(0)
        this.program.use();
        this.programMeta.setUniform("u_viewProjection", camera.getViewProjectionMatrixOrThrow());
        this.programMeta.setUniform("u_texture", 0);
        this.getChunks().forEach(chunk => {
            this.programMeta.setAttributes(
                ["in_worldPosition", "in_tilePosition", "in_textureCoordinates", "in_terrain"],
                chunk.getVertexBuffer()
            );
            renderer.drawMesh(chunk.getIndexBuffer());
        });
    }

    public dispose(): void {
        super.dispose();
        this.program.dispose();
    }

}