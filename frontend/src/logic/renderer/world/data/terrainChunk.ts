import {GLVertexArray} from "../../common/glVertexArray";
import {GLDisposable} from "../../common/glDisposable";

export class TerrainChunk {

    private readonly vertexArray: GLVertexArray;
    private readonly meshSize: number;
    private readonly additionalDisposables: GLDisposable[];

    constructor(vertexArray: GLVertexArray, meshSize: number, additionalDisposables: GLDisposable[]) {
        this.vertexArray = vertexArray;
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
        this.additionalDisposables.forEach(disposable => disposable.dispose);
        this.vertexArray.dispose();
    }

}