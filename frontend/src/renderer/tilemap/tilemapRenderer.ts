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

interface TilemapRenderModuleData {
    renderer: GLRenderer;
    program: GLProgram;
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
        const renderer = new GLRenderer(this.canvasHandle.getGL());
        const program = GLProgram.create(this.canvasHandle.getGL(), SHADER_SRC_VERT, SHADER_SRC_FRAG);
        this.data = {
            renderer: renderer,
            program: program,
            renderData: new TilemapRenderData(this.canvasHandle.getGL(), program.getInformation().attributes),
        };
    }


    public render(camera: Camera) {
        if (this.data) {

            this.updateInstanceData();

            this.data.renderData.getVertexArray().bind();

            this.data.program.use();
            this.data.program.setUniform("u_viewProjection", GLUniformType.MAT3, camera.getViewProjectionMatrixOrThrow());

            this.data.renderer.drawInstanced(this.data.renderData.getVertexCount(), this.data.renderData.getInstanceCount());
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