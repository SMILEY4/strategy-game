import {GameStateAccess} from "../../../external/state/game/gameStateAccess";
import {LocalGameStateAccess} from "../../../external/state/localgame/localGameStateAccess";
import {MsgMarkerTileContent, MsgScoutTileContent} from "../../../models/messaging/messagingTileContent";
import {PayloadGameState} from "../../../models/messaging/payloadGameState";
import {City} from "../../../models/state/city";
import {Color} from "../../../models/state/Color";
import {Country} from "../../../models/state/country";
import {GameState} from "../../../models/state/gameState";
import {Marker} from "../../../models/state/marker";
import {Scout} from "../../../models/state/scout";
import {TerrainType} from "../../../models/state/terrainType";
import {Tile} from "../../../models/state/tile";
import {TileLayerMeta} from "../../../models/state/tileLayerMeta";
import {orDefault} from "../../../shared/utils";
import {TileBorderCalculator} from "./tileBorderCalculator";
import colorToRgbArray = Color.colorToRgbArray;

/**
 * Set the world/game state
 */
export class SetGameStateAction {

    private readonly localGameStateAccess: LocalGameStateAccess;
    private readonly gameStateAccess: GameStateAccess;

    constructor(localGameStateAccess: LocalGameStateAccess, gameStateAccess: GameStateAccess) {
        this.localGameStateAccess = localGameStateAccess;
        this.gameStateAccess = gameStateAccess;
    }

    perform(game: PayloadGameState): void {
        console.log("set game state");
        const countries = this.getCountries(game);
        const tiles = this.getTiles(game);
        this.enrichTilesLayerData(tiles, game);
        this.gameStateAccess.setState(
            game.turn,
            tiles,
            countries,
            this.getCities(game),
            this.getMarkers(game),
            this.getScouts(game)
        );
        this.localGameStateAccess.clearCommands();
        this.localGameStateAccess.setCurrentState(GameState.PLAYING);
    }


    private getCountries(game: PayloadGameState): Country[] {
        return game.countries.map(country => ({
            countryId: country.baseData.countryId,
            userId: country.baseData.userId,
            color: country.baseData.color,
            advancedData: country.advancedData ? {
                resources: {
                    money: country.advancedData.resources.money
                }
            } : null
        }));
    }


    private getTiles(game: PayloadGameState): Tile[] {
        return game.tiles.map(tile => ({
            tileId: tile.baseData.tileId,
            position: {
                q: tile.baseData.position.q,
                r: tile.baseData.position.r
            },
            visibility: tile.baseData.visibility,
            generalData: tile.generalData ? {
                terrainType: tile.generalData.terrainType === "LAND" ? TerrainType.LAND : TerrainType.WATER,
                owner: tile.generalData.owner ? {
                    countryId: tile.generalData.owner?.countryId,
                    countryColor: game.countries.find(c => c.baseData.countryId === tile.generalData?.owner?.countryId)?.baseData.color,
                    cityId: tile.generalData.owner.cityId,
                } : null,
            } : null,
            advancedData: tile.advancedData ? {
                influences: tile.advancedData.influences.map(influence => ({
                    countryId: influence.countryId,
                    value: influence.value,
                    sources: influence.sources.map(influenceSource => ({
                        cityId: influenceSource.cityId,
                        value: influenceSource.value
                    }))
                })),
            } : null,
            layers: []
        }));
    }


    private getMarkers(game: PayloadGameState): Marker[] {
        const markers: Marker[] = [];
        game.tiles.forEach(tile => {
            if (tile.advancedData) {
                tile.advancedData.content.forEach(content => {
                    if (content.type === "marker") {
                        markers.push({
                            tile: {
                                tileId: tile.baseData.tileId,
                                q: tile.baseData.position.q,
                                r: tile.baseData.position.r
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
            if (tile.advancedData) {
                tile.advancedData.content.forEach(content => {
                    if (content.type === "scout") {
                        scouts.push({
                            tile: {
                                tileId: tile.baseData.tileId,
                                q: tile.baseData.position.q,
                                r: tile.baseData.position.r
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
        const country = game.countries.find(country => country.baseData.countryId === tile.generalData?.owner?.countryId);
        return colorToRgbArray(orDefault(country?.baseData.color, Color.INVALID));
    }

    private getTileCountryLayerBorders(tile: Tile, borderCalculator: TileBorderCalculator): boolean[] {
        return borderCalculator.getBorderDirections(tile.position.q, tile.position.r, tile => tile.generalData?.owner?.countryId);
    }

    private getTileCityLayerValue(tile: Tile, game: PayloadGameState): number[] {
        const city = game.cities.find(city => city.cityId === tile.generalData?.owner?.cityId);
        return colorToRgbArray(orDefault(city?.color, Color.INVALID));
    }

    private getTileCityLayerBorders(tile: Tile, borderCalculator: TileBorderCalculator): boolean[] {
        return borderCalculator.getBorderDirections(tile.position.q, tile.position.r, tile => tile.generalData?.owner?.cityId);
    }

}
