import {CanvasHandle} from "../../logic/game/canvasHandle";
import {Camera} from "../../shared/webgl/camera";
import {RenderModule} from "../common/renderModule";
import {GLProgram} from "../../shared/webgl/glProgram";

import SHADER_SRC_VERT from "./shader.vsh?raw";
import SHADER_SRC_FRAG from "./shader.fsh?raw";
import {GLUniformType} from "../../shared/webgl/glTypes";
import {TileMesh} from "./tileMesh";
import {GLRenderer} from "../../shared/webgl/glRenderer";
import {TileRepository} from "../../state/access/TileRepository";
import {TileInstanceData} from "./tileInstanceData";

interface TilemapRenderModuleData {
    renderer: GLRenderer;
    program: GLProgram;
    tileMesh: TileMesh;
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
        const tileMesh = TileMesh.build(this.canvasHandle.getGL(), program.getInformation().attributes);
        this.data = {
            renderer: renderer,
            program: program,
            tileMesh: tileMesh,
        };
    }


    public render(camera: Camera) {
        if (this.data) {

            const tileInstanceData = this.getTileInstanceData();

            this.data.program.use();
            this.data.program.setUniform("u_viewProjection", GLUniformType.MAT3, camera.getViewProjectionMatrixOrThrow());

            this.data.tileMesh.vertexArray.bind();
            tileInstanceData.vertexArray.bind()

            this.data.renderer.drawInstanced(this.data.tileMesh.vertexCount, tileInstanceData.instanceCount);
            // this.data.renderer.draw(this.data.tileMesh.vertexCount)

            tileInstanceData.additionalDisposables.forEach(disposable => disposable.dispose());
            tileInstanceData.vertexArray.dispose();
        }
    }

    private getTileInstanceData(): TileInstanceData {
        return TileInstanceData.build(this.tileRepository.getTiles(), this.canvasHandle.getGL(), this.data!.program.getInformation().attributes);
    }


    public dispose() {
        if (this.data) {
            this.data.program.dispose();
            this.data.tileMesh.additionalDisposables.forEach(disposable => disposable.dispose());
            this.data.tileMesh.vertexArray.dispose();
        }
    }


}