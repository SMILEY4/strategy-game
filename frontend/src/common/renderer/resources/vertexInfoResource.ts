import {RenderGraphResource} from "./renderGraphResource";
import {GLVertexBuffer} from "../../webgl/glVertexBuffer";
import {GLVertexArray} from "../../webgl/glVertexArray";

export class VertexInfoResource extends RenderGraphResource {

	readonly type: "standard" | "instanced";
	readonly buffers: string[];
	readonly vertexArrays: GLVertexArray[];
	vertexCount: number;
	instanceCount: number;


	constructor(key: string, type: "standard" | "instanced", buffers: string[], vertexArrays: GLVertexArray[], vertexCount: number, instanceCount: number) {
		super(key);
		this.type = type;
		this.buffers = buffers;
		this.vertexCount = vertexCount;
		this.instanceCount = instanceCount;
		this.vertexArrays = vertexArrays;
	}

}