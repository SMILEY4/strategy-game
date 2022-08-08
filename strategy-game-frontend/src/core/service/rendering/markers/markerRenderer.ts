import {Command, CommandPlaceMarker} from "../../../../models/state/command";
import {Marker} from "../../../../models/state/marker";
import {GameCanvasHandle} from "../../gameCanvasHandle";
import {TilemapUtils} from "../../tilemap/tilemapUtils";
import {BatchRenderer} from "../utils/batchRenderer";
import {Camera} from "../utils/camera";
import {ShaderAttributeType, ShaderProgram, ShaderUniformType} from "../utils/shaderProgram";
import SRC_MARKER_SHADER_FRAGMENT from "./markerShader.fsh?raw";
import SRC_MARKER_SHADER_VERTEX from "./markerShader.vsh?raw";

export class MarkerRenderer {

    private readonly gameCanvas: GameCanvasHandle;
    private batchRenderer: BatchRenderer = null as any;
    private shader: ShaderProgram = null as any;


    constructor(gameCanvas: GameCanvasHandle) {
        this.gameCanvas = gameCanvas;
    }

    public initialize() {
        this.shader = new ShaderProgram(this.gameCanvas.getGL(), {
            debugName: "markers",
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


    public render(camera: Camera, markers: Marker[], commands: Command[]) {
        this.batchRenderer.begin(camera);

        markers.forEach(m => {
            const [offX, offY] = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, m.tile.position.q, m.tile.position.r);
            const size = TilemapUtils.DEFAULT_HEX_LAYOUT.size;
            this.batchRenderer.add([
                [offX, offY, MarkerRenderer.getHash(m.countryId, 5)],
                [offX - (size[0] / 3), offY + size[1], MarkerRenderer.getHash(m.countryId, 5)],
                [offX + (size[0] / 3), offY + size[1], MarkerRenderer.getHash(m.countryId, 5)],
            ]);
        });

        commands
            .filter(cmd => cmd.commandType === "place-marker")
            .map(cmd => cmd as CommandPlaceMarker)
            .forEach(cmd => {
                const [offX, offY] = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, cmd.q, cmd.r);
                const size = TilemapUtils.DEFAULT_HEX_LAYOUT.size;
                this.batchRenderer.add([
                    [offX, offY, -1],
                    [offX - (size[0] / 3), offY + size[1], -1],
                    [offX + (size[0] / 3), offY + size[1], -1],
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


    private static getHash(input: string, maxVal: number) {
        let hash = 0, len = input.length;
        for (let i = 0; i < len; i++) {
            hash = ((hash << 5) - hash) + input.charCodeAt(i);
            hash |= 0; // to 32bit integer
        }
        return Math.abs(hash) % maxVal;
    }

}