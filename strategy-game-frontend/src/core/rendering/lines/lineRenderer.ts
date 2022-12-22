import {GameCanvasHandle} from "../gameCanvasHandle";
import {BatchRenderer} from "../utils/batchRenderer";
import {Camera} from "../utils/camera";
import {ShaderAttributeType, ShaderProgram, ShaderUniformType} from "../utils/shaderProgram";
import {ShaderSourceManager} from "../utils/shaderSourceManager";
import {LineCapsButt} from "./lineCapsButt";
import {LineJoinMiter} from "./lineJoinMiter";
import {LineMeshCreator} from "./lineMeshCreator";

interface RegisteredLine {
    id: string,
    mesh: number[][]
}

export class LineRenderer {

    public static readonly SHADER_SRC_KEY_VERTEX = "line.vertex";
    public static readonly SHADER_SRC_KEY_FRAGMENT = "line.fragment";

    private readonly gameCanvas: GameCanvasHandle;
    private readonly shaderSourceManager: ShaderSourceManager;
    private batchRenderer: BatchRenderer = null as any;
    private shader: ShaderProgram = null as any;

    private lines: RegisteredLine[] = [];


    constructor(gameCanvas: GameCanvasHandle, shaderSourceManager: ShaderSourceManager) {
        this.gameCanvas = gameCanvas;
        this.shaderSourceManager = shaderSourceManager;
    }


    initialize() {
        this.batchRenderer = new BatchRenderer(this.gameCanvas.getGL(), 64000, false);
        this.shader = new ShaderProgram(this.gameCanvas.getGL(), {
            debugName: "lineShader",
            sourceVertex: this.shaderSourceManager.resolve(LineRenderer.SHADER_SRC_KEY_VERTEX),
            sourceFragment: this.shaderSourceManager.resolve(LineRenderer.SHADER_SRC_KEY_FRAGMENT),
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
                },
                {
                    name: "in_color",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 3,
                }
            ],
            uniforms: [
                {
                    name: BatchRenderer.UNIFORM_VIEW_PROJECTION_MATRIX,
                    type: ShaderUniformType.MAT3
                },
            ]
        });
    }


    public render(camera: Camera) {
        this.batchRenderer.begin();
        this.lines.forEach(line => {
            this.batchRenderer.add(line.mesh);
        });
        this.batchRenderer.end(camera, this.shader, {uniforms: {}});
    }


    public registerLine(id: string, line: [number, number][], thickness: number, color: number[]) {
        this.removeLine(id);
        this.lines.push({
            id: id,
            mesh: LineMeshCreator.flatten2d(new LineMeshCreator().create({
                points: line,
                thickness: thickness,
                capStartFunction: LineCapsButt.start,
                capEndFunction: LineCapsButt.end,
                joinFunction: LineJoinMiter.join,
                vertexBuilder: (currentPoint: number[], currentIndex: number, vertexData: number[]) => [...vertexData, ...color]
            }))
        });
    }


    public removeLine(id: string) {
        this.lines = this.lines.filter(l => l.id !== id);
    }


    public removeAllLines() {
        this.lines = [];
    }

}