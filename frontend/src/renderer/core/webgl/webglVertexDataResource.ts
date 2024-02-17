import {VertexDataResource} from "../resources/vertexDataRenderResource";
import {GLVertexArray} from "../../../shared/webgl/glVertexArray";

export abstract class WebglVertexDataResource extends VertexDataResource {
    public abstract dispose(): void;
    public abstract getVertexArray(): GLVertexArray;
}


export class BasicWebglVertexDataResource extends WebglVertexDataResource {

    private readonly vertexArray: GLVertexArray;
    private readonly vertexCount: number;

    constructor(vertexArray: GLVertexArray, vertexCount: number) {
        super();
        this.vertexArray = vertexArray;
        this.vertexCount = vertexCount;
    }

    public dispose(): void {
        this.vertexArray.dispose()
    }

    public getVertexArray(): GLVertexArray {
        return this.vertexArray;
    }

    public getVertexCount(): number {
        return this.vertexCount;
    }

}

export class InstancedWebglVertexDataResource extends WebglVertexDataResource {

    private readonly vertexArray: GLVertexArray;
    private readonly vertexCount: number;
    private readonly instanceCount: number;


    constructor(vertexArray: GLVertexArray, vertexCount: number, instanceCount: number) {
        super();
        this.vertexArray = vertexArray;
        this.vertexCount = vertexCount;
        this.instanceCount = instanceCount;
    }

    public dispose(): void {
        this.vertexArray.dispose()
    }

    public getVertexArray(): GLVertexArray {
        return this.vertexArray;
    }

    public getVertexCount(): number {
        return this.vertexCount;
    }

    public getInstanceCount(): number {
        return this.instanceCount;
    }

}