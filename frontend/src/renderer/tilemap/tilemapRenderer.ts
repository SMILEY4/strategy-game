import {CanvasHandle} from "../../logic/game/canvasHandle";
import {Camera} from "../../shared/webgl/camera";
import {RenderModule} from "../common/renderModule";
import {GLProgram} from "../../shared/webgl/glProgram";

import SHADER_SRC_VERT from "./shader.vsh?raw";
import SHADER_SRC_FRAG from "./shader.fsh?raw";
import {GLRenderer} from "../../shared/webgl/glRenderer";
import {TileRepository} from "../../state/access/TileRepository";
import {TilemapRenderData} from "./tilemapRenderData";
import {GLUniformType} from "../../shared/webgl/glTypes";
import {TileInstanceDataBuilder} from "./tileInstanceDataBuilder";
import {GLTexture} from "../../shared/webgl/glTexture";

interface TilemapRenderModuleData {
    renderer: GLRenderer;
    program: GLProgram;
    tileset: GLTexture,
    texture: GLTexture,
    noise: GLTexture,
    renderData: TilemapRenderData;
}

export class TilemapRenderer implements RenderModule {

    private readonly canvasHandle: CanvasHandle;
    private readonly tileRepository: TileRepository;
    private data: TilemapRenderModuleData | null = null;


    constructor(canvasHandle: CanvasHandle, tileRepository: TileRepository) {
        this.canvasHandle = canvasHandle;
        this.tileRepository = tileRepository;
    }


    public initialize(): void {
        const gl = this.canvasHandle.getGL();
        const program = GLProgram.create(gl, SHADER_SRC_VERT, SHADER_SRC_FRAG);
        this.data = {
            program: program,
            renderer: new GLRenderer(gl),
            tileset: GLTexture.createFromPath(gl, "/tiles.png"),
            texture: GLTexture.createFromPath(gl, "/textures/plain_white_paper_blendable.jpg"),
            noise: GLTexture.createFromPath(gl, "/textures/noise.png"),
            renderData: new TilemapRenderData(gl, program.getInformation().attributes),
        };
    }


    public render(camera: Camera) {
        if (this.data) {

            this.updateInstanceData();

            this.data.renderData.getVertexArray().bind();

            this.data.tileset.bind(0)
            this.data.texture.bind(1)
            this.data.noise.bind(2)

            this.data.program.use();
            this.data.program.setUniform("u_viewProjection", GLUniformType.MAT3, camera.getViewProjectionMatrixOrThrow());
            this.data.program.setUniform("u_tileset", GLUniformType.SAMPLER_2D, this.data.tileset);
            this.data.program.setUniform("u_texture", GLUniformType.SAMPLER_2D, this.data.texture);
            this.data.program.setUniform("u_noise", GLUniformType.SAMPLER_2D, this.data.noise);

            this.data.renderer.drawInstanced(this.data.renderData.getVertexCount(), this.data.renderData.getInstanceCount());

            this.data.renderData.getVertexArray().unbind();
        }
    }

    private updateInstanceData() {
        const [count, array] = TileInstanceDataBuilder.build(this.tileRepository.getTiles());
        this.data?.renderData.updateInstanceData(count, array);
    }

    public dispose() {
        if (this.data) {
            this.data.program.dispose();
            this.data.renderData.dispose();
        }
    }


}