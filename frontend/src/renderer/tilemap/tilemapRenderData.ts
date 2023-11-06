import {GLVertexBuffer} from "../../shared/webgl/glVertexBuffer";
import {GLProgram} from "../../shared/webgl/glProgram";
import {GLVertexArray} from "../../shared/webgl/glVertexArray";
import {GLAttributeType} from "../../shared/webgl/glTypes";
import {BaseMeshBuilder} from "./meshbuilders/baseMeshBuilder";
import GLProgramAttribute = GLProgram.GLProgramAttribute;
import TileMesh = TilemapRenderData.TileMesh;
import InstanceData = TilemapRenderData.InstanceData;

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

    private readonly baseTileMesh: TileMesh;
    private readonly instanceBaseData: InstanceData;
    private readonly instanceOverlayData: InstanceData;
    private readonly vertexArray: GLVertexArray;

    constructor(gl: WebGL2RenderingContext, programAttributes: GLProgramAttribute[]) {
        this.baseTileMesh = this.buildBaseTileMesh(gl);
        this.instanceBaseData = this.buildEmptyInstanceData(gl);
        this.instanceOverlayData = this.buildEmptyInstanceData(gl);
        this.vertexArray = this.buildVertexArray(gl, programAttributes);
    }


    public getVertexArray(): GLVertexArray {
        return this.vertexArray;
    }

    public getVertexCount(): number {
        return this.baseTileMesh.vertexCount;
    }

    public getInstanceCount(): number {
        return this.instanceBaseData.instanceCount;
    }

    public updateInstanceBaseData(count: number, data: ArrayBuffer) {
        this.instanceBaseData.instanceCount = count;
        this.instanceBaseData.instanceBuffer.setData(data, true);
    }

    public updateInstanceOverlayData(count: number, data: ArrayBuffer) {
        this.instanceOverlayData.instanceCount = count;
        this.instanceOverlayData.instanceBuffer.setData(data, true);
    }

    public dispose() {
        this.baseTileMesh.vertexBuffer.dispose();
        this.instanceBaseData.instanceBuffer.dispose();
        this.vertexArray.dispose();
    }


    private buildBaseTileMesh(gl: WebGL2RenderingContext): TileMesh {
        return BaseMeshBuilder.build(gl);
    }

    private buildEmptyInstanceData(gl: WebGL2RenderingContext): InstanceData {
        return {
            instanceCount: 0,
            instanceBuffer: GLVertexBuffer.createEmpty(gl),
        };
    }

    private buildVertexArray(gl: WebGL2RenderingContext, programAttributes: GLProgramAttribute[]): GLVertexArray {
        return GLVertexArray.create(
            gl,
            [
                //==== tile mesh ====//
                {
                    buffer: this.baseTileMesh.vertexBuffer,
                    location: programAttributes.find(a => a.name === "in_vertexPosition")!.location,
                    type: GLAttributeType.FLOAT,
                    amountComponents: 2,
                },
                {
                    buffer: this.baseTileMesh.vertexBuffer,
                    location: programAttributes.find(a => a.name === "in_textureCoordinates")!.location,
                    type: GLAttributeType.FLOAT,
                    amountComponents: 2,
                },
                {
                    buffer: this.baseTileMesh.vertexBuffer,
                    location: programAttributes.find(a => a.name === "in_cornerData")!.location,
                    type: GLAttributeType.FLOAT,
                    amountComponents: 3,
                },
                {
                    buffer: this.baseTileMesh.vertexBuffer,
                    location: programAttributes.find(a => a.name === "in_edgeDirection")!.location,
                    type: GLAttributeType.INT,
                    amountComponents: 1,
                },
                //==== instance base data ====//
                {
                    buffer: this.instanceBaseData.instanceBuffer,
                    location: programAttributes.find(a => a.name === "in_worldPosition")!.location,
                    type: GLAttributeType.FLOAT,
                    amountComponents: 2,
                    divisor: 1,
                },
                {
                    buffer: this.instanceBaseData.instanceBuffer,
                    location: programAttributes.find(a => a.name === "in_tilesetIndex")!.location,
                    type: GLAttributeType.INT,
                    amountComponents: 1,
                    divisor: 1,
                },
                {
                    buffer: this.instanceBaseData.instanceBuffer,
                    location: programAttributes.find(a => a.name === "in_visibility")!.location,
                    type: GLAttributeType.INT,
                    amountComponents: 1,
                    divisor: 1,
                },
                //==== instance overlay data ====//
                {
                    buffer: this.instanceOverlayData.instanceBuffer,
                    location: programAttributes.find(a => a.name === "in_borderMask")!.location,
                    type: GLAttributeType.INT,
                    amountComponents: 1,
                    divisor: 1,
                },
                {
                    buffer: this.instanceOverlayData.instanceBuffer,
                    location: programAttributes.find(a => a.name === "in_borderColor")!.location,
                    type: GLAttributeType.FLOAT,
                    amountComponents: 3,
                    divisor: 1,
                },
                {
                    buffer: this.instanceOverlayData.instanceBuffer,
                    location: programAttributes.find(a => a.name === "in_fillColor")!.location,
                    type: GLAttributeType.FLOAT,
                    amountComponents: 3,
                    divisor: 1,
                },
            ],
            undefined,
        );
    }

}