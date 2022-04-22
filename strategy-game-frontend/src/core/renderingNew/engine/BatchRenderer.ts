import {Camera} from "../../rendering/utils/camera";
import ShaderProgram from "../../rendering/utils/shaderProgram";
import GLBuffer, {GLBufferType, GLBufferUsage} from "../../rendering/utils/glBuffer";

export interface BatchContext {
	camera: Camera,
	arrays: {
		currentIndexOffset: number,
		indices: number[],
		vertices: number[]
	},
	buffers: {
		indices: GLBuffer | null,
		vertices: GLBuffer | null,
	}
}

export class BatchRenderer {

	private readonly gl: WebGL2RenderingContext;
	private readonly maxIndicesCount: number;
	private context: BatchContext | null = null;


	constructor(gl: WebGL2RenderingContext, maxIndicesCount?: number) {
		this.gl = gl;
		this.maxIndicesCount = maxIndicesCount ? maxIndicesCount : 60000;
	}


	public begin(camera: Camera) {
		this.context = BatchRenderer.createInitialContext(camera);
	}


	public add(vertices: (number[])[], indices?: number[]) {
		if (!this.context) {
			throw new Error("No context found. Call 'begin' before adding vertices");
		}
		BatchRenderer.appendIndices(this.context, vertices.length, indices);
		BatchRenderer.appendVertices(this.context, vertices);
	}


	public end(shader: ShaderProgram) {
		if (!this.context) {
			throw new Error("No context found. Call 'begin' before rendering");
		}
		BatchRenderer.initializeVertexBuffer(this.gl, this.context);
		BatchRenderer.initializeIndexBuffer(this.gl, this.context);
		BatchRenderer.flushContext(this.gl, this.context, shader);
	}


	public dispose() {
		if (this.context) {
			BatchRenderer.disposeContext(this.gl, this.context);
		}
	}


	private static createInitialContext(camera: Camera): BatchContext {
		return {
			camera: camera,
			arrays: {
				currentIndexOffset: 0,
				indices: [],
				vertices: []
			},
			buffers: {
				indices: null,
				vertices: null
			}
		};
	}


	protected static appendIndices(context: BatchContext, amountVertices: number, indices?: number[]) {
		const indexData: number[] = (indices ? indices : [...Array(amountVertices).keys()]).map(index => index + context.arrays.currentIndexOffset);
		context.arrays.indices.push(...indexData);
		context.arrays.currentIndexOffset = Math.max(...indexData) + 1;
	}


	protected static appendVertices(context: BatchContext, vertices: (number[])[]) {
		vertices.forEach(v => context.arrays.vertices.push(...v));
	}


	protected static initializeVertexBuffer(gl: WebGL2RenderingContext, context: BatchContext) {
		if (!context.buffers.vertices) {
			context.buffers.vertices = new GLBuffer({
				debugName: "vertexData",
				type: GLBufferType.ARRAY_BUFFER,
				usage: GLBufferUsage.STATIC_DRAW,
				data: context.arrays.vertices
			}).create(gl);
		} else {
			context.buffers.vertices.setData(gl, context.arrays.vertices);
		}
	}


	protected static initializeIndexBuffer(gl: WebGL2RenderingContext, context: BatchContext) {
		if (!context.buffers.indices) {
			context.buffers.indices = new GLBuffer({
				debugName: "indexBuffer",
				type: GLBufferType.ELEMENT_ARRAY_BUFFER,
				usage: GLBufferUsage.STATIC_DRAW,
				data: context.arrays.indices
			}).create(gl);
		} else {
			context.buffers.indices.setData(gl, context.arrays.indices);
		}
	}


	protected static flushContext(gl: WebGL2RenderingContext, context: BatchContext, shader: ShaderProgram) {
		if (context.buffers.indices && context.buffers.vertices) {
			shader.use(gl, {
				attributeBuffers: {
					"in_position": context.buffers.vertices
				},
				uniformValues: {
					"u_viewProjection": context.camera.getViewProjectionMatrixOrThrow()
				}
			});
			context.buffers.indices.use(gl);
			gl.drawElements(
				gl.TRIANGLES,
				context.arrays.indices.length,
				gl.UNSIGNED_SHORT,
				0
			);
		}
	}

	
	protected static disposeContext(gl: WebGL2RenderingContext, context: BatchContext) {
		context?.buffers.indices?.dispose(gl);
		context?.buffers.vertices?.dispose(gl);
	}

}