import {BaseRenderer, BaseRenderTask} from "./baseRenderer";
import {Camera} from "./camera";
import {GLBuffer, GLBufferType, GLBufferUsage} from "./glBuffer";
import {ShaderProgram, ShaderUniformValues} from "./shaderProgram";
import {VertexBatchCollector} from "./vertexBatchCollector";

export class BatchRenderer {

    public static readonly UNIFORM_VIEW_PROJECTION_MATRIX = "u_viewProjection";

    private readonly gl: WebGL2RenderingContext;
    private readonly batchCollector: VertexBatchCollector;
    private readonly baseRenderer: BaseRenderer;
    private readonly shouldCacheTasks: boolean;

    private taskCache: BaseRenderTask[] = [];


    constructor(gl: WebGL2RenderingContext, maxIndicesCount: number, cacheTasks: boolean) {
        this.gl = gl;
        this.shouldCacheTasks = cacheTasks;
        this.batchCollector = new VertexBatchCollector(maxIndicesCount);
        this.baseRenderer = new BaseRenderer(gl);
    }

    public begin() {
        this.batchCollector.clear();
    }

    public add(vertices: (number[])[], indices?: number[]) {
        this.batchCollector.add(vertices, indices);
    }

    public end(camera: Camera, shader: ShaderProgram, shaderData: { uniforms: ShaderUniformValues }) {
        const tasks: BaseRenderTask[] = this.batchCollector.getBatches().map(batch => ({
            amountIndices: batch.indices.length,
            indices: new GLBuffer(this.gl, GLBufferType.ELEMENT_ARRAY_BUFFER, GLBufferUsage.STATIC_DRAW, "indexBuffer").setData(batch.indices),
            vertices: new GLBuffer(this.gl, GLBufferType.ARRAY_BUFFER, GLBufferUsage.STATIC_DRAW, "vertexData").setData(batch.vertices),
        }));
        this.draw(tasks, camera, shader, shaderData)
        if (this.shouldCacheTasks) {
            this.taskCache = tasks;
        }
    }

    public drawCache(camera: Camera, shader: ShaderProgram, shaderData: { uniforms: ShaderUniformValues }) {
        this.draw(this.taskCache, camera, shader, shaderData)
    }

    private draw(tasks: BaseRenderTask[], camera: Camera, shader: ShaderProgram, shaderData: { uniforms: ShaderUniformValues }) {
        this.baseRenderer.render(shader, tasks, {
            [BatchRenderer.UNIFORM_VIEW_PROJECTION_MATRIX]: camera.getViewProjectionMatrixOrThrow(),
            ...shaderData.uniforms
        });
    }

}