import {GLBuffer} from "./glBuffer";
import {ShaderProgram, ShaderUniformValues} from "./shaderProgram";

export interface BaseRenderTask {
    amountIndices: number,
    indices: GLBuffer | null,
    vertices: GLBuffer | null,
}


export class BaseRenderer {

    private readonly gl: WebGL2RenderingContext;


    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
    }


    public render(shader: ShaderProgram, tasks: BaseRenderTask[], uniformValues: ShaderUniformValues) {
        tasks.forEach(task => this.renderTask(shader, task, uniformValues));
    }


    private renderTask(shader: ShaderProgram, task: BaseRenderTask, uniformValues: ShaderUniformValues) {
        if (task.indices && task.vertices) {
            shader.use({
                attributeBuffers: Object.fromEntries(
                    shader.getAttributes().map(attrib => [attrib, task.vertices!!])
                ),
                uniformValues: uniformValues
            });
            task.indices.use();
            this.gl.drawElements(
                this.gl.TRIANGLES,
                task.amountIndices,
                this.gl.UNSIGNED_SHORT,
                0
            );
        }
    }


}