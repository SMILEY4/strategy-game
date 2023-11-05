import {GLRenderer} from "../../../../shared/webgl/glRenderer";
import {Camera} from "../../../../shared/webgl/camera";
import {BaseRenderLayer} from "./baseRenderLayer";
import {GLProgram} from "../../../../shared/webgl/glProgram";
import {GLUniformType} from "../../../../shared/webgl/glTypes";
import {GLTexture} from "../../../../shared/webgl/glTexture";
import {TerrainChunk} from "../data/terrainChunk";
import {MapModeRepository} from "../../../../state/access/MapModeRepository";
import {TileRepository} from "../../../../state/access/TileRepository";
import GLProgramAttribute = GLProgram.GLProgramAttribute;

export class TerrainRenderLayer extends BaseRenderLayer {

    public static readonly LAYER_ID = 0;

    private readonly mapModeRepository: MapModeRepository;
    private readonly tileRepository: TileRepository;
    private readonly program: GLProgram;
    private readonly tileset: GLTexture;
    private chunks: TerrainChunk[] = [];

    constructor(mapModeRepository: MapModeRepository, tileRepository: TileRepository, program: GLProgram, tileset: GLTexture) {
        super(TerrainRenderLayer.LAYER_ID);
        this.mapModeRepository = mapModeRepository;
        this.tileRepository = tileRepository;
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
        this.program.setUniform("u_mapMode", GLUniformType.INT, this.mapModeRepository.getMapMode().id);
        this.program.setUniform("u_selectedTile", GLUniformType.INT_VEC2, this.getSelectedTileValue());
        this.program.setUniform("u_hoverTile", GLUniformType.INT_VEC2, this.getHoverTileValue());

        this.chunks.forEach(chunk => {
            chunk.getVertexArray().bind();
            renderer.drawIndexed(chunk.getMeshSize());
        });

    }

    private getSelectedTileValue(): [number, number] {
        const selectedTile = this.tileRepository.getSelectedTile();
        if (selectedTile) {
            return [selectedTile.q, selectedTile.r];
        } else {
            return [-9999, -9999];
        }
    }

    private getHoverTileValue(): [number, number] {
        const hoverTile = this.tileRepository.getHoverTile();
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