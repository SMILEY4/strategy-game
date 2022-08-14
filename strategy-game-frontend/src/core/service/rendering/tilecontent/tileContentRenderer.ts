import {UserStateAccess} from "../../../../external/state/user/userStateAccess";
import {AppConfig} from "../../../../main";
import {City} from "../../../../models/state/city";
import {Command, CommandCreateCity, CommandPlaceMarker} from "../../../../models/state/command";
import {Country, CountryColor} from "../../../../models/state/country";
import {Marker} from "../../../../models/state/marker";
import {GameCanvasHandle} from "../../gameCanvasHandle";
import {TilemapUtils} from "../../tilemap/tilemapUtils";
import {BatchRenderer} from "../utils/batchRenderer";
import {Camera} from "../utils/camera";
import {ShaderAttributeType, ShaderProgram, ShaderUniformType} from "../utils/shaderProgram";
import Texture from "../utils/texture";
import SRC_SHADER_FRAGMENT from "./tileContentShader.fsh?raw";
import SRC_SHADER_VERTEX from "./tileContentShader.vsh?raw";

export class TileContentRenderer {

    private readonly gameCanvas: GameCanvasHandle;
    private readonly userAccess: UserStateAccess;
    private batchRenderer: BatchRenderer = null as any;
    private shader: ShaderProgram = null as any;
    private texture: Texture = null as any;

    constructor(gameCanvas: GameCanvasHandle, userAccess: UserStateAccess) {
        this.gameCanvas = gameCanvas;
        this.userAccess = userAccess;
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


    public render(camera: Camera, countries: Country[], cities: City[], markers: Marker[], commands: Command[]) {

        const userId = this.userAccess.getUserId();
        const userCountryId = countries.find(c => c.userId === userId)?.countryId

        this.batchRenderer.begin(camera);

        cities
            .forEach(e => this.addCity(e.tile.position.q, e.tile.position.r, this.getColor(countries, e.country.countryId, false)));
        commands
            .filter(e => e.commandType === "create-city")
            .map(e => e as CommandCreateCity)
            .forEach(e => this.addCity(e.q, e.r, this.getColor(countries, (userCountryId ? userCountryId : "?"), true)));

        markers
            .forEach(e => this.addMarker(e.tile.position.q, e.tile.position.r, this.getColor(countries, e.countryId, false)));
        commands
            .filter(e => e.commandType === "place-marker")
            .map(e => e as CommandPlaceMarker)
            .forEach(e => this.addMarker(e.q, e.r, this.getColor(countries, "?", true)));

        this.texture.bind();
        this.batchRenderer.end(this.shader, {
            attributes: ["in_position", "in_textureCoords", "in_color"],
            uniforms: {"u_texture": 0}
        });

    }


    private addCity(q: number, r: number, color: number[]) {
        const [x, y] = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
        const width = TilemapUtils.DEFAULT_HEX_LAYOUT.size[0];
        const height = TilemapUtils.DEFAULT_HEX_LAYOUT.size[1];
        this.batchRenderer.add([
            [x - width, y + height, 0.5, 0, ...color],
            [x + width, y + height, 1, 0, ...color],
            [x + width, y - height, 1, 1, ...color],
            [x - width, y + height, 0.5, 0, ...color],
            [x + width, y - height, 1, 1, ...color],
            [x - width, y - height, 0.5, 1, ...color],
        ]);
    }

    private addMarker(q: number, r: number, color: number[]) {
        const [x, y] = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
        const width = TilemapUtils.DEFAULT_HEX_LAYOUT.size[0];
        const height = TilemapUtils.DEFAULT_HEX_LAYOUT.size[1];
        this.batchRenderer.add([
            [x - width, y + height, 0, 0, ...color],
            [x + width, y + height, 0.5, 0, ...color],
            [x + width, y - height, 0.5, 1, ...color],
            [x - width, y + height, 0, 0, ...color],
            [x + width, y - height, 0.5, 1, ...color],
            [x - width, y - height, 0, 1, ...color],
        ]);
    }

    private getColor(countries: Country[], countryId: string, isCommand: boolean): [number, number, number, number] {
        const country = countries.find(c => c.countryId === countryId);
        if (country) {
            if (country.color === CountryColor.RED) return [1, 0, 0, isCommand ? 0.5 : 1];
            if (country.color === CountryColor.GREEN) return [0, 1, 0, isCommand ? 0.5 : 1];
            if (country.color === CountryColor.BLUE) return [0, 0, 1, isCommand ? 0.5 : 1];
            if (country.color === CountryColor.CYAN) return [0, 1, 1, isCommand ? 0.5 : 1];
            if (country.color === CountryColor.MAGENTA) return [1, 0, 1, isCommand ? 0.5 : 1];
            if (country.color === CountryColor.YELLOW) return [1, 1, 0, isCommand ? 0.5 : 1];
        }
        return [1, 1, 1, isCommand ? 0.5 : 1];
    }


    public dispose() {
        this.batchRenderer.dispose();
        this.shader.dispose();
        this.texture.dispose();
    }

}