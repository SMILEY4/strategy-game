import {WebGlVertexDataGenerator, WebGlVertexDataGeneratorCreateData} from "../../core/webgl/webglVertexDataGenerator";
import {BasicWebglVertexDataResource, WebglVertexDataResource} from "../../core/webgl/webglVertexDataResource";
import {GLVertexBuffer} from "../../../shared/webgl/glVertexBuffer";
import {GLVertexArray} from "../../../shared/webgl/glVertexArray";
import {GLAttributeType} from "../../../shared/webgl/glTypes";

export class FullQuadVertexGenerator extends WebGlVertexDataGenerator {

    public create(ctx: WebGlVertexDataGeneratorCreateData): WebglVertexDataResource {
        const data = new ArrayBuffer(6);
        const vertexBuffer = GLVertexBuffer.create(ctx.gl, data);
        const vertexArray = GLVertexArray.create(
            ctx.gl,
            [
                {
                    buffer: vertexBuffer,
                    location: ctx.shader.getInformation().attributes.find(a => a.name === "in_worldPosition")!.location,
                    type: GLAttributeType.FLOAT,
                    amountComponents: 2,
                },
                {
                    buffer: vertexBuffer,
                    location: ctx.shader.getInformation().attributes.find(a => a.name === "in_textureCoordinates")!.location,
                    type: GLAttributeType.FLOAT,
                    amountComponents: 2,
                },
            ]
        );
        return new BasicWebglVertexDataResource(vertexArray, 6);
    }

    public update(vertexData: WebglVertexDataResource): void {
        // do nothing
    }

}