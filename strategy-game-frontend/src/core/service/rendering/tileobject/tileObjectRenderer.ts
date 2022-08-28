import {GameStore} from "../../../../external/state/game/gameStore";
import {LocalGameStore} from "../../../../external/state/localgame/localGameStore";
import {UserStateAccess} from "../../../../external/state/user/userStateAccess";
import {City} from "../../../../models/state/city";
import {Command, CommandCreateCity, CommandPlaceMarker} from "../../../../models/state/command";
import {Country, CountryColor} from "../../../../models/state/country";
import {GameCanvasHandle} from "../../gameCanvasHandle";
import {TilemapUtils} from "../../tilemap/tilemapUtils";
import {BatchRenderer} from "../utils/batchRenderer";
import {Camera} from "../utils/camera";
import {ShaderAttributeType, ShaderProgram, ShaderUniformType} from "../utils/shaderProgram";
import {TextEntryRegion, TextRenderer} from "../utils/textRenderer";
import Texture from "../utils/texture";
import SRC_SHADER_FRAGMENT from "./tileObjectShader.fsh?raw";
import SRC_SHADER_VERTEX from "./tileObjectShader.vsh?raw";

export class TileObjectRenderer {

    private readonly COLOR_WHITE: [number, number, number, number] = [1, 1, 1, 1];

    private readonly gameCanvas: GameCanvasHandle;
    private readonly userAccess: UserStateAccess;
    private batchRenderer: BatchRenderer = null as any;
    private textRenderer: TextRenderer = null as any;
    private shader: ShaderProgram = null as any;
    private textureSprites: Texture = null as any;


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
                    name: "in_position", // x, y
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 2,
                },
                {
                    name: "in_textureCoords", // textureId, u, v
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 3,
                },
                {
                    name: "in_color", // r, g, b, a
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 4,
                }
            ],
            uniforms: [
                {
                    name: BatchRenderer.UNIFORM_VIEW_PROJECTION_MATRIX,
                    type: ShaderUniformType.MAT3
                },
                {
                    name: "u_texture_sprites",
                    type: ShaderUniformType.SAMPLER_2D
                },
                {
                    name: "u_texture_labels",
                    type: ShaderUniformType.SAMPLER_2D
                }
            ]
        });
        this.textureSprites = Texture.createFromPath(this.gameCanvas.getGL(), "/resources.png");
        this.batchRenderer = new BatchRenderer(this.gameCanvas.getGL());
        this.textRenderer = new TextRenderer(this.gameCanvas.getGL());
    }


    public render(camera: Camera, gameState: GameStore.StateValues, localGameState: LocalGameStore.StateValues) {

        const userId = this.userAccess.getUserId();
        const userCountryId = gameState.countries.find(c => c.userId === userId)?.countryId;

        this.prepareLabelTexture(gameState.cities, localGameState.commands);

        this.batchRenderer.begin(camera);

        gameState.cities.forEach(e => {
            this.addCitySprite(e.tile.q, e.tile.r, this.getColor(gameState.countries, e.countryId, false));
            this.addCityLabel(camera.getZoom(), e.tile.q, e.tile.r, this.textRenderer.getRegion(e.name))
        });

        localGameState.commands
            .filter(e => e.commandType === "create-city")
            .map(e => e as CommandCreateCity)
            .forEach(e => {
                this.addCitySprite(e.q, e.r, this.getColor(gameState.countries, (userCountryId ? userCountryId : "?"), true))
                this.addCityLabel(camera.getZoom(), e.q, e.r, this.textRenderer.getRegion(e.name + " (P)"))
            });

        gameState.markers
            .forEach(e => this.addMarkerSprite(e.tile.q, e.tile.r, this.getColor(gameState.countries, e.countryId, false)));

        localGameState.commands
            .filter(e => e.commandType === "place-marker")
            .map(e => e as CommandPlaceMarker)
            .forEach(e => this.addMarkerSprite(e.q, e.r, this.getColor(gameState.countries, (userCountryId ? userCountryId : "?"), true)));

        this.textureSprites.bind(0)
        this.textRenderer.getTexture()?.bind(1)

        this.batchRenderer.end(this.shader, {
            uniforms: {
                "u_texture_sprites": 0,
                "u_texture_labels": 1
            }
        });

    }


    private prepareLabelTexture(cities: City[], commands: Command[]) {
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
    }


    private addCitySprite(q: number, r: number, color: number[]) {
        const [x, y] = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
        const width = TilemapUtils.DEFAULT_HEX_LAYOUT.size[0];
        const height = TilemapUtils.DEFAULT_HEX_LAYOUT.size[1];
        this.addObject(x, y, width, height, color, 0, 0.5, 1, 0, 1);
    }


    private addCityLabel(camZoom: number, q: number, r: number, region: TextEntryRegion | undefined) {
        if (region) {
            const [x, y] = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
            const width = region.width / 2;
            const height = region.height / 2;
            this.addObject(x, y - 10, width / camZoom, height / camZoom, this.COLOR_WHITE, 1, region.u0, region.u1, region.v0, region.v1)
        }
    }


    private addMarkerSprite(q: number, r: number, color: number[]) {
        const [x, y] = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
        const width = TilemapUtils.DEFAULT_HEX_LAYOUT.size[0];
        const height = TilemapUtils.DEFAULT_HEX_LAYOUT.size[1];
        this.addObject(x, y, width, height, color, 0, 0, 0.5, 0, 1);
    }


    private addObject(x: number, y: number, width: number, height: number, color: number[], textureIndex: number, u0: number, u1: number, v0: number, v1: number) {
        this.batchRenderer.add([
            [x - width, y + height, textureIndex, u0, v1, ...color],
            [x + width, y + height, textureIndex, u1, v1, ...color],
            [x + width, y - height, textureIndex, u1, v0, ...color],
            [x - width, y + height, textureIndex, u0, v1, ...color],
            [x + width, y - height, textureIndex, u1, v0, ...color],
            [x - width, y - height, textureIndex, u0, v0, ...color],
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
        this.textureSprites.dispose();
    }

}