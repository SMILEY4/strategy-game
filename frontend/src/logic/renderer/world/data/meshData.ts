import {MixedArrayBuffer} from "../../common/mixedArrayBuffer";
import {GLVertexBuffer} from "../../common/glVertexBuffer";
import {GLIndexBuffer} from "../../common/glIndexBuffer";
import {GLVertexArray} from "../../common/glVertexArray";
import AttributeConfig = GLVertexArray.AttributeConfig;


export class MeshData {

    private readonly vertexBuffer: GLVertexBuffer;
    private readonly indexBuffer: GLIndexBuffer;
    private readonly vertexArray: GLVertexArray;
    private readonly amountIndices: number;

    constructor(vertexBuffer: GLVertexBuffer, indexBuffer: GLIndexBuffer, vertexArray: GLVertexArray, amountIndices: number) {
        this.vertexBuffer = vertexBuffer;
        this.indexBuffer = indexBuffer;
        this.vertexArray = vertexArray;
        this.amountIndices = amountIndices;
    }

    public getVertexBuffer(): GLVertexBuffer {
        return this.vertexBuffer;
    }

    public getIndexBuffer(): GLIndexBuffer {
        return this.indexBuffer;
    }

    public getVertexArray(): GLVertexArray {
        return this.vertexArray;
    }

    public getAmountIndices(): number {
        return this.amountIndices;
    }

    public dispose() {
        this.vertexBuffer.dispose();
        this.indexBuffer.dispose();
        this.vertexArray.dispose();
    }
}


export namespace MeshData {

    export function create(
        gl: WebGL2RenderingContext,
        indices: MixedArrayBuffer,
        vertices: MixedArrayBuffer,
        amountIndices: number,
        attributes: (vertexBuffer: GLVertexBuffer) => AttributeConfig[],
    ) {
        const vertexBuffer = GLVertexBuffer.create(gl, vertices.getRawBuffer()!);
        const indexBuffer = GLIndexBuffer.create(gl, indices.getRawBuffer()!, amountIndices);
        const vertexArray = GLVertexArray.create(gl, attributes(vertexBuffer), indexBuffer);
        return new MeshData(vertexBuffer, indexBuffer, vertexArray, amountIndices);
    }

}