import {Camera} from "../../rendering/utils/camera";
import {BatchContext} from "./BatchContext";
import ShaderProgram from "../../rendering/utils/shaderProgram";
import GLBuffer, {GLBufferType, GLBufferUsage} from "../../rendering/utils/glBuffer";


export class BatchRenderer {

	private context: BatchContext | null = null;

	public begin(gl: WebGL2RenderingContext, camera: Camera) {
		// TODO: what happens if index-buffer full -> split arrays,buffers into chunks
		this.context = {
			gl: gl,
			camera: camera,
			arrays: {
				currentIndexOffset: 0,
				indices: [],
				vertexData: []
			},
			buffers: {
				indices: null,
				vertexData: null
			}
		};
	}


	public add(vertices: (number[])[], indices?: number[]) {
		if (!this.context) {
			throw new Error("No context found. Call 'begin' before rendering");
		}
		const indexOffset: number = this.context.arrays.currentIndexOffset;
		const indexData: number[] = (indices ? indices : [...Array(vertices.length).keys()]).map(index => index + indexOffset);
		this.context.arrays.currentIndexOffset = Math.max(...indexData) + 1;
		this.context.arrays.indices.push(...indexData);
		vertices.forEach(vertex => this.context?.arrays.vertexData.push(...vertex));
	}


	public end(shader: ShaderProgram) {
		if (!this.context) {
			throw new Error("No context found. Call 'begin' before rendering");
		}

		const gl = this.context.gl;

		this.context.buffers.vertexData = new GLBuffer({
			debugName: "vertexData",
			type: GLBufferType.ARRAY_BUFFER,
			usage: GLBufferUsage.STATIC_DRAW,
			data: this.context.arrays.vertexData
		}).create(gl);
		this.context.buffers.indices = new GLBuffer({
			debugName: "indexBuffer",
			type: GLBufferType.ELEMENT_ARRAY_BUFFER,
			usage: GLBufferUsage.STATIC_DRAW,
			data: this.context.arrays.indices
		}).create(gl);

		shader.use(this.context.gl, {
			attributeBuffers: {
				"in_position": this.context.buffers.vertexData
			},
			uniformValues: {
				"u_viewProjection": this.context.camera.getViewProjectionMatrixOrThrow()
			}
		});
		this.context.buffers.indices.use(gl);
		gl.drawElements(
			gl.TRIANGLES,
			this.context.buffers.indices.getSize(),
			gl.UNSIGNED_SHORT,
			0
		);

		this.context.buffers.indices.dispose(gl);
		this.context.buffers.vertexData.dispose(gl);
	}


}