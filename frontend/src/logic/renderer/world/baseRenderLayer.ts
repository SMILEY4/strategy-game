import {RenderChunk} from "./renderChunk";
import {GLRenderer} from "../common/glRenderer";
import {Camera} from "../common/camera";

export abstract class BaseRenderLayer {

    private chunks: RenderChunk[] = [];

    setChunks(chunks: RenderChunk[]) {
        this.chunks = chunks;
    }

    getChunks(): RenderChunk[] {
        return this.chunks;
    }

    abstract render(camera: Camera, renderer: GLRenderer): void;

    public dispose() {
        this.getChunks().forEach(chunk => chunk.dispose())
    }
}