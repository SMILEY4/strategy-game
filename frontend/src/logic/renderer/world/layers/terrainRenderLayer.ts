import {GLRenderer} from "../../common/glRenderer";
import {Camera} from "../../common/camera";
import {BaseRenderLayer} from "./baseRenderLayer";
import {GLProgram} from "../../common/glProgram";
import {GLUniformType} from "../../common/glTypes";
import {GLTexture} from "../../common/glTexture";
import {GameStateAccess} from "../../../../state/access/GameStateAccess";
import {TerrainChunk} from "../data/terrainChunk";
import GLProgramAttribute = GLProgram.GLProgramAttribute;

export class TerrainRenderLayer extends BaseRenderLayer {

    public static readonly LAYER_ID = 0;

    private readonly program: GLProgram;
    private readonly tileset: GLTexture;
    private chunks: TerrainChunk[] = [];

    constructor(program: GLProgram, tileset: GLTexture) {
        super(TerrainRenderLayer.LAYER_ID);
        this.program = program;
        this.tileset = tileset;
    }

    public setChunks(chunks: TerrainChunk[]) {
        this.chunks = chunks;
    }

    public render(camera: Camera, renderer: GLRenderer): void {

        // todo: possible optimisation
        //  - use instanced rendering -> share single value for whole hex-tile

        this.tileset.bind(0);
        this.program.use();

        this.program.setUniform("u_viewProjection", GLUniformType.MAT3, camera.getViewProjectionMatrixOrThrow());
        this.program.setUniform("u_texture", GLUniformType.SAMPLER_2D, this.tileset);
        this.program.setUniform("u_mapMode", GLUniformType.INT, GameStateAccess.getMapMode().id);
        this.program.setUniform("u_selectedTile", GLUniformType.INT_VEC2, this.getSelectedTileValue());
        this.program.setUniform("u_hoverTile", GLUniformType.INT_VEC2, this.getHoverTileValue());

        this.chunks.forEach(chunk => {
            chunk.getVertexArray().bind();
            renderer.drawMesh(chunk.getMeshSize());
        });

    }

    private getSelectedTileValue(): [number, number] {
        const selectedTile = GameStateAccess.getSelectedTile();
        if (selectedTile) {
            return [selectedTile.q, selectedTile.r];
        } else {
            return [-9999, -9999];
        }
    }

    private getHoverTileValue(): [number, number] {
        const hoverTile = GameStateAccess.getHoverTile();
        if (hoverTile) {
            return [hoverTile.q, hoverTile.r];
        } else {
            return [-9999, -9999];
        }
    }

    public getShaderAttributes(): GLProgramAttribute[] {
        return this.program.getInformation().attributes;
    }

    public dispose(): void {
        this.program.dispose();
    }

    public disposeWorldData(): void {
        this.chunks.forEach(chunk => chunk.dispose());
    }

}