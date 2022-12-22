import {GameCanvasHandle} from "../gameCanvasHandle";
import {GLBuffer, GLBufferType, GLBufferUsage} from "../utils/glBuffer";
import {ShaderAttributeType, ShaderProgram, ShaderUniformType} from "../utils/shaderProgram";
import {LineCapsButt} from "./lineCapsButt";
import {LineJoinMiter} from "./lineJoinMiter";
import {LineMeshCreator} from "./lineMeshCreator";

export class LineRenderer {

    private readonly canvasHandle: GameCanvasHandle;
    private readonly srcVert: string;
    private readonly srcFrag: string;
    private shader: ShaderProgram | null = null;
    private bufferData: GLBuffer | null = null;

    constructor(canvasHandle: GameCanvasHandle, srcShaderVertex: string, srcShaderFragment: string) {
        this.canvasHandle = canvasHandle;
        this.srcVert = srcShaderVertex;
        this.srcFrag = srcShaderFragment;
    }


    initialize() {
        const gl = this.canvasHandle?.getGL()!!;
        this.shader = new ShaderProgram(gl, {
            debugName: "lineShader",
            sourceVertex: this.srcVert,
            sourceFragment: this.srcFrag,
            attributes: [
                {
                    name: "in_position",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 2,
                },
                {
                    name: "in_texcoords",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 2,
                }
            ],
            uniforms: [
                {
                    name: "u_viewProjection",
                    type: ShaderUniformType.MAT3
                },
            ]
        });
    }

    public render(line: [number, number][], thickness: number, viewMatrix: Float32Array) {
        const gl = this.canvasHandle.getGL();
        if (this.bufferData) {
            this.bufferData.dispose();
        }
        const lineMesh = new LineMeshCreator().create({
            points: line,
            thickness: thickness,
            capStartFunction: LineCapsButt.start,
            capEndFunction: LineCapsButt.end,
            joinFunction: LineJoinMiter.join,
            vertexBuilder: LineMeshCreator.defaultVertexBuilder
        });
        const data = LineMeshCreator.flatten(lineMesh);

        this.bufferData = new GLBuffer(gl, GLBufferType.ARRAY_BUFFER, GLBufferUsage.STATIC_DRAW, "line.data").setData(data);

        this.shader!!.use({
            attributeBuffers: {
                "in_position": this.bufferData!!,
                "in_texcoords": this.bufferData!!,
            },
            uniformValues: {
                "u_viewProjection": viewMatrix,
            }
        });

        gl.drawArrays(
            gl.TRIANGLES,
            0,
            data.length / 4
        );

    }

}