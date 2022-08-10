import {GameCanvasHandle} from "../../gameCanvasHandle";
import {BatchRenderer} from "../utils/batchRenderer";
import {Camera} from "../utils/camera";
import {ShaderAttributeType, ShaderProgram, ShaderUniformType} from "../utils/shaderProgram";
import {TextRenderer} from "../utils/textRenderer";
import SRC_SHADER_FRAGMENT from "./test.fsh?raw";
import SRC_SHADER_VERTEX from "./test.vsh?raw";

export class TestRenderer {

    private readonly gameCanvas: GameCanvasHandle;
    private batchRenderer: BatchRenderer = null as any;
    private shader: ShaderProgram = null as any;
    private textRenderer: TextRenderer = null as any;

    constructor(gameCanvas: GameCanvasHandle) {
        this.gameCanvas = gameCanvas;
    }

    public initialize() {
        this.shader = new ShaderProgram(this.gameCanvas.getGL(), {
            debugName: "tileContent",
            sourceVertex: SRC_SHADER_VERTEX,
            sourceFragment: SRC_SHADER_FRAGMENT,
            attributes: [
                {
                    name: "in_position",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 2,
                    stride: 4,
                    offset: 0,
                },
                {
                    name: "in_textureCoords",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 2,
                    stride: 4,
                    offset: 2,
                }
            ],
            uniforms: [
                {
                    name: BatchRenderer.UNIFORM_VIEW_PROJECTION_MATRIX,
                    type: ShaderUniformType.MAT3
                },
                {
                    name: "u_texture",
                    type: ShaderUniformType.SAMPLER_2D
                }
            ]
        });
        this.batchRenderer = new BatchRenderer(this.gameCanvas.getGL());

        this.textRenderer = new TextRenderer(this.gameCanvas.getGL());
        this.textRenderer.addText("Hello World", 300, 50, {
            color: "red",
            font: "20px monospace",
            align: "center",
            baseline: "middle",
        });

    }


    public render(camera: Camera) {

        const x = 400;
        const y = 300;
        const width = 300;
        const height = 50;

        this.batchRenderer.begin(camera);
        this.batchRenderer.add([
            [x - width / camera.getZoom(), y + height / camera.getZoom(), 0, 1],
            [x + width / camera.getZoom(), y + height / camera.getZoom(), 1, 1],
            [x + width / camera.getZoom(), y - height / camera.getZoom(), 1, 0],
            [x - width / camera.getZoom(), y + height / camera.getZoom(), 0, 1],
            [x + width / camera.getZoom(), y - height / camera.getZoom(), 1, 0],
            [x - width / camera.getZoom(), y - height / camera.getZoom(), 0, 0],
        ]);

        this.textRenderer.getTexture("Hello World")?.bind()

        this.batchRenderer.end(this.shader, {
            attributes: ["in_position", "in_textureCoords"],
            uniforms: {"u_texture": 0}
        });

    }


    public dispose() {
        this.batchRenderer.dispose();
        this.shader.dispose();
        this.textRenderer.dispose();
    }

}