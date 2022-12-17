import {BatchRenderer} from "../utils/batchRenderer";
import {ShaderAttributeType, ShaderProgram, ShaderUniformType} from "../utils/shaderProgram";

export class LineRenderer {

    private readonly shader: ShaderProgram

    constructor(gl: WebGL2RenderingContext, srcShaderVertex: string, srcShaderFragment: string) {
        this.shader = new ShaderProgram(gl, {
            debugName: "lineShader",
            sourceVertex: srcShaderVertex,
            sourceFragment: srcShaderFragment,
            attributes: [
                {
                    name: "in_position",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 2,
                }
            ],
            uniforms: [
                {
                    name: BatchRenderer.UNIFORM_VIEW_PROJECTION_MATRIX,
                    type: ShaderUniformType.MAT3
                },
                {
                    name: "u_color",
                    type: ShaderUniformType.VEC4
                }
            ]
        });
    }

}