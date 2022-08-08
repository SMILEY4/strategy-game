import {City} from "../../../../models/state/city";
import {Command, CommandCreateCity, CommandPlaceMarker} from "../../../../models/state/command";
import {Marker} from "../../../../models/state/marker";
import {GameCanvasHandle} from "../../gameCanvasHandle";
import {TilemapUtils} from "../../tilemap/tilemapUtils";
import {BatchRenderer} from "../utils/batchRenderer";
import {Camera} from "../utils/camera";
import {ShaderAttributeType, ShaderProgram, ShaderUniformType} from "../utils/shaderProgram";
import Texture from "../utils/texture";
import SRC_MARKER_SHADER_FRAGMENT from "./tileContentShader.fsh?raw";
import SRC_MARKER_SHADER_VERTEX from "./tileContentShader.vsh?raw";

export class TileContentRenderer {

    private readonly gameCanvas: GameCanvasHandle;
    private batchRenderer: BatchRenderer = null as any;
    private shader: ShaderProgram = null as any;
    private texture: Texture = null as any;


    constructor(gameCanvas: GameCanvasHandle) {
        this.gameCanvas = gameCanvas;
    }

    public initialize() {
        this.shader = new ShaderProgram(this.gameCanvas.getGL(), {
            debugName: "tileContent",
            sourceVertex: SRC_MARKER_SHADER_VERTEX,
            sourceFragment: SRC_MARKER_SHADER_FRAGMENT,
            attributes: [
                {
                    name: "in_position",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 2,
                    stride: 8,
                    offset: 0,
                },
                {
                    name: "in_textureCoords",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 2,
                    stride: 8,
                    offset: 2,
                },
                {
                    name: "in_color",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 4,
                    stride: 8,
                    offset: 4,
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
        this.texture = Texture.createFromPath(this.gameCanvas.getGL(), "/resources.png");
        this.batchRenderer = new BatchRenderer(this.gameCanvas.getGL());
    }


    public render(camera: Camera, cities: City[], markers: Marker[], commands: Command[]) {

        this.batchRenderer.begin(camera);

        markers.forEach(e => {

            const [x, y] = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, e.tile.position.q, e.tile.position.r);
            const width = TilemapUtils.DEFAULT_HEX_LAYOUT.size[0];
            const height = TilemapUtils.DEFAULT_HEX_LAYOUT.size[1];
            const color = [1, 1, 1, 1]

            this.batchRenderer.add([
                [x - width, y + height, 0, 0, ...color],
                [x + width, y + height, 0.5, 0, ...color],
                [x + width, y - height, 0.5, 1, ...color],
                [x - width, y + height, 0, 0, ...color],
                [x + width, y - height, 0.5, 1, ...color],
                [x - width, y - height, 0, 1, ...color],
            ]);
        });

        commands
            .filter(e => e.commandType === "place-marker")
            .map(e => e as CommandPlaceMarker)
            .forEach(e => {

                const [x, y] = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, e.q, e.r);
                const width = TilemapUtils.DEFAULT_HEX_LAYOUT.size[0];
                const height = TilemapUtils.DEFAULT_HEX_LAYOUT.size[1];
                const color = [1, 1, 1, 0.5]

                this.batchRenderer.add([
                    [x - width, y + height, 0, 0, ...color],
                    [x + width, y + height, 0.5, 0, ...color],
                    [x + width, y - height, 0.5, 1, ...color],
                    [x - width, y + height, 0, 0, ...color],
                    [x + width, y - height, 0.5, 1, ...color],
                    [x - width, y - height, 0, 1, ...color],
                ]);
            });

        cities.forEach(e => {

            const [x, y] = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, e.tile.position.q, e.tile.position.r);
            const width = TilemapUtils.DEFAULT_HEX_LAYOUT.size[0];
            const height = TilemapUtils.DEFAULT_HEX_LAYOUT.size[1];
            const color = [1, 1, 1, 1]

            this.batchRenderer.add([
                [x - width, y + height, 0.5, 0, ...color],
                [x + width, y + height, 1, 0, ...color],
                [x + width, y - height, 1, 1, ...color],
                [x - width, y + height, 0.5, 0, ...color],
                [x + width, y - height, 1, 1, ...color],
                [x - width, y - height, 0.5, 1, ...color],
            ]);
        });

        commands
            .filter(e => e.commandType === "create-city")
            .map(e => e as CommandCreateCity)
            .forEach(e => {

                const [x, y] = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, e.q, e.r);
                const width = TilemapUtils.DEFAULT_HEX_LAYOUT.size[0];
                const height = TilemapUtils.DEFAULT_HEX_LAYOUT.size[1];
                const color = [1, 1, 1, 0.5]

                this.batchRenderer.add([
                    [x - width, y + height, 0.5, 0, ...color],
                    [x + width, y + height, 1, 0, ...color],
                    [x + width, y - height, 1, 1, ...color],
                    [x - width, y + height, 0.5, 0, ...color],
                    [x + width, y - height, 1, 1, ...color],
                    [x - width, y - height, 0.5, 1, ...color],
                ]);
            });

        this.texture.bind();
        this.batchRenderer.end(this.shader, {
            attributes: ["in_position", "in_textureCoords", "in_color"],
            uniforms: {"u_texture": 0}
        });

    }


    public dispose() {
        this.batchRenderer.dispose();
        this.shader.dispose();
        this.texture.dispose();
    }

}