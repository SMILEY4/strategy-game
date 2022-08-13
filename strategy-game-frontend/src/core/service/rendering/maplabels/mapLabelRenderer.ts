import {City} from "../../../../models/state/city";
import {Command, CommandCreateCity} from "../../../../models/state/command";
import {Country} from "../../../../models/state/country";
import {GameCanvasHandle} from "../../gameCanvasHandle";
import {TilemapUtils} from "../../tilemap/tilemapUtils";
import {BatchRenderer} from "../utils/batchRenderer";
import {Camera} from "../utils/camera";
import {ShaderAttributeType, ShaderProgram, ShaderUniformType} from "../utils/shaderProgram";
import {TextEntryRegion, TextRenderer} from "../utils/textRenderer";
import SRC_SHADER_FRAGMENT from "./maplabel.fsh?raw";
import SRC_SHADER_VERTEX from "./maplabel.vsh?raw";

export class MapLabelRenderer {

    private readonly gameCanvas: GameCanvasHandle;
    private batchRenderer: BatchRenderer = null as any;
    private shader: ShaderProgram = null as any;
    private textRenderer: TextRenderer = null as any;

    constructor(gameCanvas: GameCanvasHandle) {
        this.gameCanvas = gameCanvas;
    }

    public initialize() {
        this.shader = new ShaderProgram(this.gameCanvas.getGL(), {
            debugName: "mapLabels",
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
    }


    public render(camera: Camera, countries: Country[], cities: City[], commands: Command[]) {

        const cityNames: string[] = [];
        cities
            .forEach(c => cityNames.push(c.name));
        commands
            .filter(e => e.commandType === "create-city")
            .map(e => e as CommandCreateCity)
            .forEach(e => cityNames.push(e.name + " (P)"));

        const wasNewTextAdded = cityNames
            .map(name => this.textRenderer.addTextIfNotExists(name, {
                text: name,
                width: null,
                height: 30,
                font: "20px monospace",
                color: "black",
                align: "center" as CanvasTextAlign,
                baseline: "middle" as CanvasTextBaseline,
                shadowBlur: 4,
                shadowColor: "white"
            }))
            .some(added => added);
        if (wasNewTextAdded) {
            this.textRenderer.update();
        }

        this.batchRenderer.begin(camera);

        cities
            .forEach(e => this.addCityLabel(camera, e.tile.position.q, e.tile.position.r, this.textRenderer.getRegion(e.name)));
        commands
            .filter(e => e.commandType === "create-city")
            .map(e => e as CommandCreateCity)
            .forEach(e => this.addCityLabel(camera, e.q, e.r, this.textRenderer.getRegion(e.name + " (P)")));

        this.textRenderer.getTexture()?.bind();
        this.batchRenderer.end(this.shader, {
            attributes: ["in_position", "in_textureCoords"],
            uniforms: {"u_texture": 0}
        });

    }

    private addCityLabel(camera: Camera, q: number, r: number, region: TextEntryRegion | undefined) {
        if (region) {
            const [x, y] = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
            const width = region.width / 2;
            const height = region.height / 2;
            this.batchRenderer.add([
                [x - (width / camera.getZoom()), y + (height / camera.getZoom()) - 10, region.u0, region.v1],
                [x + (width / camera.getZoom()), y + (height / camera.getZoom()) - 10, region.u1, region.v1],
                [x + (width / camera.getZoom()), y - (height / camera.getZoom()) - 10, region.u1, region.v0],
                [x - (width / camera.getZoom()), y + (height / camera.getZoom()) - 10, region.u0, region.v1],
                [x + (width / camera.getZoom()), y - (height / camera.getZoom()) - 10, region.u1, region.v0],
                [x - (width / camera.getZoom()), y - (height / camera.getZoom()) - 10, region.u0, region.v0],
            ]);
        }
    }


    public dispose() {
        this.batchRenderer.dispose();
        this.shader.dispose();
        this.textRenderer.dispose();
    }

}