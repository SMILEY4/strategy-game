import {RenderChunk} from "./renderChunk";
import {GLRenderer} from "../common/glRenderer";
import {Camera} from "../common/camera";
import {AttributeInfo} from "../common/glProgram";
import {GLProgram} from "../common2/glProgram";
import GLProgramAttribute = GLProgram.GLProgramAttribute;

export abstract class BaseRenderLayer {

    private chunks: RenderChunk[] = [];

    setChunks(chunks: RenderChunk[]) {
        this.chunks = chunks;
    }

    getChunks(): RenderChunk[] {
        return this.chunks;
    }

    abstract render(camera: Camera, renderer: GLRenderer): void;

    abstract getShaderAttributes(): GLProgramAttribute[]

    public dispose() {
        this.getChunks().forEach(chunk => chunk.dispose())
    }
}