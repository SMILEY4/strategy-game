import {BaseRenderLayer} from "./baseRenderLayer";
import {GLProgram} from "../../../../shared/webgl/glProgram";
import {Camera} from "../../../../shared/webgl/camera";
import {GLRenderer} from "../../../../shared/webgl/glRenderer";
import {GLUniformType} from "../../../../shared/webgl/glTypes";
import {LineDataBuilder} from "../builders/lineDataBuilder";

export class LinesRenderLayer extends BaseRenderLayer {

    public static readonly LAYER_ID = 2;

    private readonly program: GLProgram;
    private readonly gl: WebGL2RenderingContext;
    private lines: number[][][] = [];

    constructor(gl: WebGL2RenderingContext, program: GLProgram) {
        super(LinesRenderLayer.LAYER_ID);
        this.program = program;
        this.gl = gl;
    }


    public setLines(lines: number[][][]) {
        this.lines = lines;
    }


    public render(camera: Camera, renderer: GLRenderer): void {
        if (this.lines.length === 0) {
            return;
        }

        const mesh = LineDataBuilder.build(this.gl, this.lines, this.getShaderAttributes());

        this.program.use();
        this.program.setUniform("u_viewProjection", GLUniformType.MAT3, camera.getViewProjectionMatrixOrThrow());

        mesh.getVertexArray().bind();
        renderer.drawIndexed(mesh.getAmountIndices());

        mesh.dispose()

    }


    public getShaderAttributes(): GLProgram.GLProgramAttribute[] {
        return this.program.getInformation().attributes;
    }

    public dispose(): void {
        this.program.dispose();
    }

    public disposeWorldData(): void {
    }


}