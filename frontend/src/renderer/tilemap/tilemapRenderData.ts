import {GLVertexBuffer} from "../../shared/webgl/glVertexBuffer";
import {GLProgram} from "../../shared/webgl/glProgram";
import {GLVertexArray} from "../../shared/webgl/glVertexArray";
import {GLAttributeType} from "../../shared/webgl/glTypes";
import GLProgramAttribute = GLProgram.GLProgramAttribute;
import TileMesh = TilemapRenderData.TileMesh;
import InstanceData = TilemapRenderData.InstanceData;
import {TileMeshBuilder} from "./tileMeshBuilder";

export namespace TilemapRenderData {

    export interface TileMesh {
        vertexCount: number,
        vertexBuffer: GLVertexBuffer
    }

    export interface InstanceData {
        instanceCount: number,
        instanceBuffer: GLVertexBuffer,
    }

}

export class TilemapRenderData {

    private readonly tileMesh: TileMesh;
    private readonly instanceData: InstanceData;
    private readonly vertexArray: GLVertexArray;

    constructor(gl: WebGL2RenderingContext, programAttributes: GLProgramAttribute[]) {
        this.tileMesh = this.buildTileMesh(gl);
        this.instanceData = this.buildInitialInstanceData(gl);
        this.vertexArray = this.buildVertexArray(gl, programAttributes);
    }


    public getVertexArray(): GLVertexArray {
        return this.vertexArray;
    }

    public getVertexCount(): number {
        return this.tileMesh.vertexCount;
    }

    public getInstanceCount(): number {
        return this.instanceData.instanceCount;
    }

    public updateInstanceData(count: number, data: ArrayBuffer) {
        this.instanceData.instanceCount = count;
        this.instanceData.instanceBuffer.setData(data, true);
    }

    public dispose() {
        this.tileMesh.vertexBuffer.dispose();
        this.instanceData.instanceBuffer.dispose();
        this.vertexArray.dispose();
    }


    private buildTileMesh(gl: WebGL2RenderingContext): TileMesh {
        return TileMeshBuilder.build(gl);
    }

    private buildInitialInstanceData(gl: WebGL2RenderingContext): InstanceData {
        return {
            instanceCount: 0,
            instanceBuffer: GLVertexBuffer.createEmpty(gl),
        };
    }

    private buildVertexArray(gl: WebGL2RenderingContext, programAttributes: GLProgramAttribute[]): GLVertexArray {
        return GLVertexArray.create(
            gl,
            [
                {
                    buffer: this.tileMesh.vertexBuffer,
                    location: programAttributes.find(a => a.name === "in_vertexPosition")!.location,
                    type: GLAttributeType.FLOAT,
                    amountComponents: 2,
                },
                {
                    buffer: this.tileMesh.vertexBuffer,
                    location: programAttributes.find(a => a.name === "in_textureCoordinates")!.location,
                    type: GLAttributeType.FLOAT,
                    amountComponents: 2,
                },
                {
                    buffer: this.instanceData.instanceBuffer,
                    location: programAttributes.find(a => a.name === "in_worldPosition")!.location,
                    type: GLAttributeType.FLOAT,
                    amountComponents: 2,
                    divisor: 1,
                },
            ],
            undefined,
        );
    }

}