import {GLBuffer} from "../common/glBuffer";

export class RenderChunk {

    private readonly chunkQ: number;
    private readonly chunkR: number;
    private readonly vertexBuffer: GLBuffer;
    private readonly indexBuffer: GLBuffer;

    constructor(chunkQ: number, chunkR: number, vertexBuffer: GLBuffer, indexBuffer: GLBuffer) {
        this.chunkQ = chunkQ;
        this.chunkR = chunkR;
        this.vertexBuffer = vertexBuffer;
        this.indexBuffer = indexBuffer;
    }

    getChunkQ(): number {
        return this.chunkQ;
    }

    getChunkR(): number {
        return this.chunkR;
    }

    getVertexBuffer(): GLBuffer {
        return this.vertexBuffer;
    }

    getIndexBuffer(): GLBuffer {
        return this.indexBuffer;
    }

    public dispose() {
        this.vertexBuffer.dispose();
        this.indexBuffer.dispose();
    }

}