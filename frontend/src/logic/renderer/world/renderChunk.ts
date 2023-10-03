import {GLVertexArray} from "../common/glVertexArray";
import {GLIndexBuffer} from "../common/glIndexBuffer";
import {GLVertexBuffer} from "../common/glVertexBuffer";
import {GLDisposable} from "../common/glDisposable";

export class RenderChunk {

    private readonly chunkQ: number;
    private readonly chunkR: number;
    private readonly vertexArray: GLVertexArray;
    private readonly meshSize: number;
    private readonly additionalDisposables: GLDisposable[];

    constructor(chunkQ: number, chunkR: number, vertexBuffer: GLVertexArray, meshSize: number, additionalDisposables: GLDisposable[]) {
        this.chunkQ = chunkQ;
        this.chunkR = chunkR;
        this.vertexArray = vertexBuffer;
        this.meshSize = meshSize;
        this.additionalDisposables = additionalDisposables;
    }

    getVertexArray(): GLVertexArray {
        return this.vertexArray;
    }

    getMeshSize(): number {
        return this.meshSize;
    }

    public dispose() {
        this.additionalDisposables.forEach(disposable => disposable.dispose)
        this.vertexArray.dispose();
    }

}