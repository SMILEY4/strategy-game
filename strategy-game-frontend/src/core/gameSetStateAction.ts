import {MsgMarkerTileContent, MsgScoutTileContent} from "../external/api/models/messagingTileContent";
import {PayloadGameState} from "../external/api/models/payloadGameState";
import {orDefault} from "../shared/utils";
import {BuildingType} from "./models/buildingType";
import {City} from "./models/city";
import {Color} from "./models/Color";
import {Country} from "./models/country";
import {GameState} from "./models/gameState";
import {Marker} from "./models/marker";
import {Province} from "./models/province";
import {ResourceType} from "./models/resourceType";
import {Route} from "./models/route";
import {Scout} from "./models/scout";
import {TerrainType} from "./models/terrainType";
import {Tile} from "./models/tile";
import {TileLayerMeta} from "./models/tileLayerMeta";
import {TileResourceType} from "./models/tileResourceType";
import {GameRepository} from "./required/gameRepository";
import {WorldRepository} from "./required/worldRepository";
import {TileBorderCalculator} from "./tileBorderCalculator";
import colorToRgbArray = Color.colorToRgbArray;

/**
 * Set the world/game state
 */
export class GameSetStateAction {

    private readonly gameRepository: GameRepository;
    private readonly worldRepository: WorldRepository;

    constructor(gameRepository: GameRepository, worldRepository: WorldRepository) {
        this.gameRepository = gameRepository;
        this.worldRepository = worldRepository;
    }

    perform(game: PayloadGameState): void {
        console.log("set game/world state");
        const countries = this.getCountries(game);
        const tiles = this.getTiles(game);
        this.enrichTilesLayerData(tiles, game);
        this.worldRepository.set(
            game.turn,
            tiles,
            countries,
            this.getCities(game),
            this.getProvinces(game),
            this.getMarkers(game),
            this.getScouts(game),
            this.getRoutes(game)
        );
        this.gameRepository.clearCommands();
        this.gameRepository.setGameState(GameState.PLAYING);
    }


    private getCountries(game: PayloadGameState): Country[] {
        return game.countries.map(country => ({
            countryId: country.dataTier1.countryId,
            userId: country.dataTier1.userId,
            color: country.dataTier1.color,
        }));
    }

    private getTiles(game: PayloadGameState): Tile[] {
        return game.tiles.map(tile => ({
            tileId: tile.dataTier0.tileId,
            position: {
                q: tile.dataTier0.position.q,
                r: tile.dataTier0.position.r
            },
            visibility: tile.dataTier0.visibility,
            dataTier1: tile.dataTier1 ? {
                terrainType: TerrainType.fromString(tile.dataTier1.terrainType),
                resourceType: TileResourceType.fromString(tile.dataTier1.resourceType),
                owner: tile.dataTier1.owner ? {
                    countryId: tile.dataTier1.owner?.countryId,
                    provinceId: tile.dataTier1.owner?.provinceId,
                    countryColor: game.countries.find(c => c.dataTier1.countryId === tile.dataTier1?.owner?.countryId)?.dataTier1.color,
                    cityId: tile.dataTier1.owner.cityId,
                } : null,
            } : null,
            dataTier2: tile.dataTier2 ? {
                influences: tile.dataTier2.influences.map(influence => ({
                    countryId: influence.countryId,
                    provinceId: influence.provinceId,
                    cityId: influence.cityId,
                    amount: influence.amount
                })),
            } : null,
            layers: []
        }));
    }

    private getMarkers(game: PayloadGameState): Marker[] {
        const markers: Marker[] = [];
        game.tiles.forEach(tile => {
            if (tile.dataTier2) {
                tile.dataTier2.content.forEach(content => {
                    if (content.type === "marker") {
                        markers.push({
                            tile: {
                                tileId: tile.dataTier0.tileId,
                                q: tile.dataTier0.position.q,
                                r: tile.dataTier0.position.r
                            },
                            countryId: (content as MsgMarkerTileContent).countryId
                        });
                    }
                });
            }
        });
        return markers;
    }


    private getScouts(game: PayloadGameState): Scout[] {
        const scouts: Scout[] = [];
        game.tiles.forEach(tile => {
            if (tile.dataTier2) {
                tile.dataTier2.content.forEach(content => {
                    if (content.type === "scout") {
                        scouts.push({
                            tile: {
                                tileId: tile.dataTier0.tileId,
                                q: tile.dataTier0.position.q,
                                r: tile.dataTier0.position.r
                            },
                            turn: (content as MsgScoutTileContent).turn,
                            countryId: (content as MsgScoutTileContent).countryId
                        });
                    }
                });
            }
        });
        return scouts;
    }


    private getCities(game: PayloadGameState): City[] {
        return game.cities.map(city => ({
            cityId: city.cityId,
            name: city.name,
            countryId: city.countryId,
            tile: {
                tileId: city.tile.tileId,
                q: city.tile.q,
                r: city.tile.r
            },
            isProvinceCapital: city.isProvinceCapital,
            buildings: city.buildings.map(b => ({
                type: BuildingType.fromString(b.type),
                tile: b.tile ? {
                    tileId: b.tile.tileId,
                    q: b.tile.q,
                    r: b.tile.r
                } : null,
                active: b.active
            }))
        }));
    }


    private getProvinces(game: PayloadGameState): Province[] {
        return game.provinces.map(province => ({
            provinceId: province.provinceId,
            countryId: province.countryId,
            cityIds: province.cityIds,
            provinceCapitalCityId: province.provinceCapitalCityId,
            resources: province.dataTier3
                ? new Map<ResourceType, number>(Object.entries(province.dataTier3!!.resourceBalance).map(e => [ResourceType.fromString(e[0]), e[1]]))
                : null,
            tradeRoutes: province.tradeRoutes
        }));
    }


    private enrichTilesLayerData(tiles: Tile[], game: PayloadGameState) {
        const borderCalculator = new TileBorderCalculator(tiles);
        tiles.forEach(tile => this.enrichTileLayerData(tile, game, borderCalculator));
    }

    private enrichTileLayerData(tile: Tile, game: PayloadGameState, borderCalculator: TileBorderCalculator) {
        tile.layers = [
            {
                layerId: TileLayerMeta.ID_COUNTRY,
                value: this.getTileCountryLayerValue(tile, game),
                borderDirections: this.getTileCountryLayerBorders(tile, borderCalculator)
            },
            {
                layerId: TileLayerMeta.ID_PROVINCE,
                value: this.getTileProvinceLayerValue(tile, game),
                borderDirections: this.getTileProvinceLayerBorders(tile, borderCalculator)
            },
            {
                layerId: TileLayerMeta.ID_CITY,
                value: this.getTileCityLayerValue(tile, game),
                borderDirections: this.getTileCityLayerBorders(tile, borderCalculator)
            },
        ];
    }

    private getTileCountryLayerValue(tile: Tile, game: PayloadGameState): number[] {
        const country = game.countries.find(country => country.dataTier1.countryId === tile.dataTier1?.owner?.countryId);
        return colorToRgbArray(orDefault(country?.dataTier1.color, Color.INVALID));
    }

    private getTileCountryLayerBorders(tile: Tile, borderCalculator: TileBorderCalculator): boolean[] {
        return borderCalculator.getBorderDirections(tile.position.q, tile.position.r, tile => tile.dataTier1?.owner?.countryId);
    }

    private getTileProvinceLayerValue(tile: Tile, game: PayloadGameState): number[] {
        const province = game.provinces.find(province => province.provinceId === tile.dataTier1?.owner?.provinceId);
        const capital = game.cities.find(city => city.cityId == province?.provinceCapitalCityId);
        return colorToRgbArray(orDefault(capital?.color, Color.INVALID));
    }

    private getTileProvinceLayerBorders(tile: Tile, borderCalculator: TileBorderCalculator): boolean[] {
        return borderCalculator.getBorderDirections(tile.position.q, tile.position.r, tile => tile.dataTier1?.owner?.provinceId);
    }

    private getTileCityLayerValue(tile: Tile, game: PayloadGameState): number[] {
        const city = game.cities.find(city => city.cityId === tile.dataTier1?.owner?.cityId);
        return colorToRgbArray(orDefault(city?.color, Color.INVALID));
    }

    private getTileCityLayerBorders(tile: Tile, borderCalculator: TileBorderCalculator): boolean[] {
        return borderCalculator.getBorderDirections(tile.position.q, tile.position.r, tile => tile.dataTier1?.owner?.cityId);
    }

    private getRoutes(game: PayloadGameState): Route[] {
        return game.routes;
    }

}
