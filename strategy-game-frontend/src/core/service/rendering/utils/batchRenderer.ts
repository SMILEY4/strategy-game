import {Camera} from "./camera";
import {GLBuffer, GLBufferType, GLBufferUsage} from "./glBuffer";
import {ShaderProgram} from "./shaderProgram";

export interface BatchContext {
    camera: Camera,
    batches: Batch[]
}

export interface Batch {
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

    public static readonly UNIFORM_VIEW_PROJECTION_MATRIX = "u_viewProjection";

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
        if (BatchRenderer.willOverflowBatch(BatchRenderer.getLatestBatch(this.context), vertices.length, indices, this.maxIndicesCount)) {
            BatchRenderer.addNewBatch(this.context);
        }
        BatchRenderer.appendIndices(this.context, vertices.length, indices);
        BatchRenderer.appendVertices(this.context, vertices);
    }


    public end(shader: ShaderProgram, shaderData: { attributes: string[], uniforms: object }) {
        if (!this.context) {
            throw new Error("No context found. Call 'begin' before rendering");
        }
        BatchRenderer.flushContext(this.gl, this.context, shader, shaderData);
    }


    public dispose() {
        if (this.context) {
            BatchRenderer.disposeContext(this.gl, this.context);
        }
    }


    private static createInitialContext(camera: Camera): BatchContext {
        return {
            camera: camera,
            batches: [{
                arrays: {
                    currentIndexOffset: 0,
                    indices: [],
                    vertices: []
                },
                buffers: {
                    indices: null,
                    vertices: null
                }
            }]
        };
    }


    protected static getLatestBatch(context: BatchContext): Batch {
        return context.batches[context.batches.length - 1];
    }


    protected static willOverflowBatch(batch: Batch, vertexCount: number, indices: number[] | undefined, maxIndicesAmount: number) {
        const nextSize = batch.arrays.indices.length + (indices ? indices.length : vertexCount);
        return nextSize > maxIndicesAmount;
    }


    protected static addNewBatch(context: BatchContext) {
        context.batches.push({
            arrays: {
                currentIndexOffset: 0,
                indices: [],
                vertices: []
            },
            buffers: {
                indices: null,
                vertices: null
            }
        });
    }

    protected static appendIndices(context: BatchContext, amountVertices: number, indices?: number[]) {
        const batch = BatchRenderer.getLatestBatch(context);
        const indexData: number[] = BatchRenderer.getIndices(indices, amountVertices).map(index => index + batch.arrays.currentIndexOffset);
        batch.arrays.indices.push(...indexData);
        batch.arrays.currentIndexOffset = Math.max(...indexData) + 1;
    }


    private static getIndices(indices: number[] | undefined | null, amountVertices: number): number[] {
        return indices
			? indices
			: [...Array(amountVertices).keys()];
    }


    protected static appendVertices(context: BatchContext, vertices: (number[])[]) {
        const batch = BatchRenderer.getLatestBatch(context);
        vertices.forEach(v => batch.arrays.vertices.push(...v));
    }


    protected static initializeVertexBuffer(gl: WebGL2RenderingContext, batch: Batch) {
        if (!batch.buffers.vertices) {
            batch.buffers.vertices = new GLBuffer(gl, GLBufferType.ARRAY_BUFFER, GLBufferUsage.STATIC_DRAW, "vertexData").setData(batch.arrays.vertices);
        } else {
            batch.buffers.vertices.setData(batch.arrays.vertices);
        }
    }


    protected static initializeIndexBuffer(gl: WebGL2RenderingContext, batch: Batch) {
        if (!batch.buffers.indices) {
            batch.buffers.indices = new GLBuffer(gl, GLBufferType.ELEMENT_ARRAY_BUFFER, GLBufferUsage.STATIC_DRAW, "indexBuffer").setData(batch.arrays.indices);
        } else {
            batch.buffers.indices.setData(batch.arrays.indices);
        }
    }


    protected static flushContext(gl: WebGL2RenderingContext, context: BatchContext, shader: ShaderProgram, shaderData: { attributes: string[], uniforms: object }) {
        context.batches.forEach(batch => BatchRenderer.flushBatch(gl, batch, context.camera, shader, shaderData));
    }


    protected static flushBatch(gl: WebGL2RenderingContext, batch: Batch, camera: Camera, shader: ShaderProgram, shaderData: { attributes: string[], uniforms: object }) {
        BatchRenderer.initializeVertexBuffer(gl, batch);
        BatchRenderer.initializeIndexBuffer(gl, batch);
        if (batch.buffers.indices && batch.buffers.vertices) {
            shader.use({
                attributeBuffers: Object.fromEntries(
                    shaderData.attributes.map(attrib => [attrib, batch.buffers.vertices])
                ),
                uniformValues: {
                    "u_viewProjection": camera.getViewProjectionMatrixOrThrow(),
                    ...shaderData.uniforms
                }
            });
            batch.buffers.indices.use();
            gl.drawElements(
                gl.TRIANGLES,
                batch.arrays.indices.length,
                gl.UNSIGNED_SHORT,
                0
            );
        }
    }


    protected static disposeContext(gl: WebGL2RenderingContext, context: BatchContext) {
        context.batches.forEach(batch => {
            batch.buffers.indices?.dispose();
            batch.buffers.vertices?.dispose();
        });
    }

}