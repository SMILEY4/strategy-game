import {City} from "../../../../models/state/city";
import {Command, CommandCreateCity} from "../../../../models/state/command";
import {GameCanvasHandle} from "../../gameCanvasHandle";
import {TilemapUtils} from "../../tilemap/tilemapUtils";
import {BatchRenderer} from "../utils/batchRenderer";
import {Camera} from "../utils/camera";
import {ShaderAttributeType, ShaderProgram, ShaderUniformType} from "../utils/shaderProgram";
import SRC_MARKER_SHADER_FRAGMENT from "./cityShader.fsh?raw";
import SRC_MARKER_SHADER_VERTEX from "./cityShader.vsh?raw";

export class CityRenderer {

    private readonly gameCanvas: GameCanvasHandle;
    private batchRenderer: BatchRenderer = null as any;
    private shader: ShaderProgram = null as any;


    constructor(gameCanvas: GameCanvasHandle) {
        this.gameCanvas = gameCanvas;
    }

    public initialize() {
        this.shader = new ShaderProgram(this.gameCanvas.getGL(), {
            debugName: "cities",
            sourceVertex: SRC_MARKER_SHADER_VERTEX,
            sourceFragment: SRC_MARKER_SHADER_FRAGMENT,
            attributes: [
                {
                    name: "in_position",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 2,
                    stride: 3,
                    offset: 0,
                },
                {
                    name: "in_markerdata",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 1,
                    stride: 3,
                    offset: 2,
                }
            ],
            uniforms: [
                {
                    name: "u_viewProjection",
                    type: ShaderUniformType.MAT3
                }
            ]
        });
        this.batchRenderer = new BatchRenderer(this.gameCanvas.getGL());
    }


    public render(camera: Camera, cities: City[], commands: Command[]) {
        this.batchRenderer.begin(camera);

        cities.forEach(c => {
            const [offX, offY] = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, c.tile.position.q, c.tile.position.r);
            const size = TilemapUtils.DEFAULT_HEX_LAYOUT.size;
            this.batchRenderer.add([
                [offX, offY + 4, -1],
                [offX - (size[0] / 3), offY - size[1] + 4, -1],
                [offX + (size[0] / 3), offY - size[1] + 4, -1],
            ]);
        });

        commands
            .filter(cmd => cmd.commandType === "create-city")
            .map(cmd => cmd as CommandCreateCity)
            .forEach(c => {
                const [offX, offY] = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, c.q, c.r);
                const size = TilemapUtils.DEFAULT_HEX_LAYOUT.size;
                this.batchRenderer.add([
                    [offX, offY + 4, -1],
                    [offX - (size[0] / 3), offY - size[1] + 4, -1],
                    [offX + (size[0] / 3), offY - size[1] + 4, -1],
                ]);
            });

        this.batchRenderer.end(this.shader, {
            attributes: ["in_position", "in_markerdata"],
            uniforms: {}
        });

    }


    public dispose() {
        this.batchRenderer.dispose();
        this.shader.dispose();
    }

}