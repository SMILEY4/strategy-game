import {GLBuffer} from "../common/glBuffer";
import {GLVertexArray} from "../common/glVertexArray";

export class RenderChunk {

    private readonly chunkQ: number;
    private readonly chunkR: number;
    private readonly vertexBuffer: GLVertexArray;
    private readonly indexBuffer: GLBuffer;

    constructor(chunkQ: number, chunkR: number, vertexBuffer: GLVertexArray, indexBuffer: GLBuffer) {
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

    getVertexBuffer(): GLVertexArray {
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