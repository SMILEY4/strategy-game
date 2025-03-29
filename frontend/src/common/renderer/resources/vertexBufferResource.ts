import {RenderGraphResource} from "./renderGraphResource";
import {GLVertexBuffer} from "../../webgl/glVertexBuffer";

export class VertexBufferResource extends RenderGraphResource {

	readonly buffer: GLVertexBuffer;

	constructor(key: string, buffer: GLVertexBuffer) {
		super(key);
		this.buffer = buffer;
	}

}