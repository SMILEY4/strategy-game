import {MsgMarkerTileContent, MsgScoutTileContent} from "../models/messaging/messagingTileContent";
import {PayloadGameState} from "../models/messaging/payloadGameState";
import {City} from "../models/state/city";
import {Color} from "../models/state/Color";
import {Country} from "../models/state/country";
import {GameState} from "../models/state/gameState";
import {Marker} from "../models/state/marker";
import {Scout} from "../models/state/scout";
import {TerrainType} from "../models/state/terrainType";
import {Tile} from "../models/state/tile";
import {TileLayerMeta} from "../models/state/tileLayerMeta";
import {orDefault} from "../shared/utils";
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
        console.log("set game state");
        const countries = this.getCountries(game);
        const tiles = this.getTiles(game);
        this.enrichTilesLayerData(tiles, game);
        this.worldRepository.set(
            game.turn,
            tiles,
            countries,
            this.getCities(game),
            this.getMarkers(game),
            this.getScouts(game)
        );
        this.gameRepository.clearCommands();
        this.gameRepository.setGameState(GameState.PLAYING);
    }


    private getCountries(game: PayloadGameState): Country[] {
        return game.countries.map(country => ({
            countryId: country.dataTier1.countryId,
            userId: country.dataTier1.userId,
            color: country.dataTier1.color,
            dataTier3: country.dataTier3 ? {
                resources: {
                    money: country.dataTier3.resources.money
                }
            } : null
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
                terrainType: this.getTerrainType(tile.dataTier1.terrainType),
                owner: tile.dataTier1.owner ? {
                    countryId: tile.dataTier1.owner?.countryId,
                    countryColor: game.countries.find(c => c.dataTier1.countryId === tile.dataTier1?.owner?.countryId)?.dataTier1.color,
                    cityId: tile.dataTier1.owner.cityId,
                } : null,
            } : null,
            dataTier2: tile.dataTier2 ? {
                influences: tile.dataTier2.influences.map(influence => ({
                    countryId: influence.countryId,
                    cityId: influence.cityId,
                    amount: influence.amount
                })),
            } : null,
            layers: []
        }));
    }

    private getTerrainType(strType: string): TerrainType {
        if (strType === "WATER") {
            return TerrainType.WATER;
        }
        if (strType === "MOUNTAIN") {
            return TerrainType.MOUNTAIN;
        }
        if (strType === "LAND") {
            return TerrainType.LAND;
        }
        throw new Error("Unknown terrain type: '" + strType + "'");
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
            isCity: city.city,
            parentCity: city.parentCity
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

    private getTileCityLayerValue(tile: Tile, game: PayloadGameState): number[] {
        const city = game.cities.find(city => city.cityId === tile.dataTier1?.owner?.cityId);
        return colorToRgbArray(orDefault(city?.color, Color.INVALID));
    }

    private getTileCityLayerBorders(tile: Tile, borderCalculator: TileBorderCalculator): boolean[] {
        return borderCalculator.getBorderDirections(tile.position.q, tile.position.r, tile => tile.dataTier1?.owner?.cityId);
    }

}
