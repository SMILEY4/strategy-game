import {GameStore} from "../../../../external/state/game/gameStore";
import {LocalGameStore} from "../../../../external/state/localgame/localGameStore";
import {UserStateAccess} from "../../../../external/state/user/userStateAccess";
import {City} from "../../../../models/state/city";
import {Command, CommandCreateCity, CommandPlaceMarker, CommandPlaceScout} from "../../../../models/state/command";
import {Country} from "../../../../models/state/country";
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
        this.batchRenderer = new BatchRenderer(this.gameCanvas.getGL(), 64000, false);
        this.textRenderer = new TextRenderer(this.gameCanvas.getGL());
    }


    public render(camera: Camera, gameState: GameStore.StateValues, localGameState: LocalGameStore.StateValues) {

        const userId = this.userAccess.getUserId();
        const userCountryId = gameState.countries.find(c => c.userId === userId)?.countryId;

        this.prepareLabelTexture(gameState.cities, localGameState.commands);

        this.batchRenderer.begin();

        // CITIES
        gameState.cities.forEach(e => {
            this.addCitySprite(e.tile.q, e.tile.r, e.isCity, this.getColor(gameState.countries, e.countryId, false));
            this.addCityLabel(camera.getZoom(), e.tile.q, e.tile.r, this.textRenderer.getRegion(e.name));
        });

        localGameState.commands
            .filter(e => e.commandType === "create-city")
            .map(e => e as CommandCreateCity)
            .forEach(e => {
                this.addCitySprite(e.q, e.r, e.parentCity === null, this.getColor(gameState.countries, (userCountryId ? userCountryId : "?"), true));
                this.addCityLabel(camera.getZoom(), e.q, e.r, this.textRenderer.getRegion(e.name + " (P)"));
            });

        // MARKERS
        gameState.markers
            .forEach(e => this.addMarkerSprite(e.tile.q, e.tile.r, this.getColor(gameState.countries, e.countryId, false)));

        localGameState.commands
            .filter(e => e.commandType === "place-marker")
            .map(e => e as CommandPlaceMarker)
            .forEach(e => this.addMarkerSprite(e.q, e.r, this.getColor(gameState.countries, (userCountryId ? userCountryId : "?"), true)));

        // SCOUTS
        gameState.scouts
            .forEach(e => this.addScoutSprite(e.tile.q, e.tile.r, this.getColor(gameState.countries, e.countryId, false)));

        localGameState.commands
            .filter(e => e.commandType === "place-scout")
            .map(e => e as CommandPlaceScout)
            .forEach(e => this.addScoutSprite(e.q, e.r, this.getColor(gameState.countries, (userCountryId ? userCountryId : "?"), true)));

        this.textureSprites.bind(0);
        this.textRenderer.getTexture()?.bind(1);

        this.batchRenderer.end(camera, this.shader, {
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


    private addCitySprite(q: number, r: number, isCity: boolean, color: number[]) {
        const [x, y] = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
        const width = TilemapUtils.DEFAULT_HEX_LAYOUT.size[0] * (isCity ? 1 : 0.6);
        const height = TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] * (isCity ? 1 : 0.6);;
        this.addObject(x, y, width, height, color, 0, 1 / 3, 2 / 3, 0, 1);
    }


    private addCityLabel(camZoom: number, q: number, r: number, region: TextEntryRegion | undefined) {
        if (region) {
            const [x, y] = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
            const width = region.width / 2;
            const height = region.height / 2;
            this.addObject(x, y - 10, width / camZoom, height / camZoom, this.COLOR_WHITE, 1, region.u0, region.u1, region.v0, region.v1);
        }
    }


    private addMarkerSprite(q: number, r: number, color: number[]) {
        const [x, y] = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
        const width = TilemapUtils.DEFAULT_HEX_LAYOUT.size[0];
        const height = TilemapUtils.DEFAULT_HEX_LAYOUT.size[1];
        this.addObject(x, y, width, height, color, 0, 0, 1 / 3, 0, 1);
    }


    private addScoutSprite(q: number, r: number, color: number[]) {
        const [x, y] = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
        const width = TilemapUtils.DEFAULT_HEX_LAYOUT.size[0];
        const height = TilemapUtils.DEFAULT_HEX_LAYOUT.size[1];
        this.addObject(x, y, width, height, color, 0, 2 / 3, 1, 0, 1);
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
            return [country.color.red / 255, country.color.green / 255, country.color.blue / 255, isCommand ? 0.5 : 1];
        } else {
            return [1, 1, 1, isCommand ? 0.5 : 1];
        }
    }


    public dispose() {
        this.shader.dispose();
        this.textureSprites.dispose();
    }

}