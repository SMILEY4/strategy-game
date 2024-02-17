import {VertexDataGenerator} from "../resources/vertexDataGenerator";
import {WebglVertexDataResource} from "./webglVertexDataResource";
import {GLProgram} from "../../../shared/webgl/glProgram";

export abstract class WebGlVertexDataGenerator extends VertexDataGenerator<WebGlVertexDataGeneratorCreateData> {
    public abstract create(ctx: WebGlVertexDataGeneratorCreateData): WebglVertexDataResource
    public abstract update(vertexData: WebglVertexDataResource): void
}

export interface WebGlVertexDataGeneratorCreateData {
    gl: WebGL2RenderingContext,
    shader: GLProgram
}