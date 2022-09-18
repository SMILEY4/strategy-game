import {GameStateAccess} from "../../../external/state/game/gameStateAccess";
import {LocalGameStateAccess} from "../../../external/state/localgame/localGameStateAccess";
import {MsgMarkerTileContent, MsgScoutTileContent} from "../../../models/messaging/messagingTileContent";
import {PayloadGameState} from "../../../models/messaging/payloadGameState";
import {City} from "../../../models/state/city";
import {Country} from "../../../models/state/country";
import {GameState} from "../../../models/state/gameState";
import {Marker} from "../../../models/state/marker";
import {Province} from "../../../models/state/Province";
import {Scout} from "../../../models/state/scout";
import {TerrainType} from "../../../models/state/terrainType";
import {Tile} from "../../../models/state/tile";
import {BordersCalculateAction} from "../border/bordersCalculateAction";
import {TileBorderCalculator} from "../border/tileBorderCalculator";

/**
 * Set the world/game state
 */
export class SetGameStateAction {

    private readonly localGameStateAccess: LocalGameStateAccess;
    private readonly gameStateAccess: GameStateAccess;
    private readonly calculateBordersAction: BordersCalculateAction;

    constructor(localGameStateAccess: LocalGameStateAccess, gameStateAccess: GameStateAccess, calculateBordersAction: BordersCalculateAction) {
        this.localGameStateAccess = localGameStateAccess;
        this.gameStateAccess = gameStateAccess;
        this.calculateBordersAction = calculateBordersAction;
    }

    perform(game: PayloadGameState): void {
        console.log("set game state");
        const countries = this.getCountries(game);
        const tiles = this.getTiles(game);
        this.enrichTilesLayerData(tiles);
        // this.calculateBordersAction.perform(tiles);
        this.gameStateAccess.setState(
            game.turn,
            tiles,
            countries,
            this.getProvinces(game),
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


    private getProvinces(game: PayloadGameState): Province[] {
        return game.provinces.map(province => ({
            provinceId: province.provinceId,
            countryId: province.countryId,
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
                    provinceId: tile.generalData.owner?.provinceId,
                    cityId: tile.generalData.owner.cityId,
                } : null,
            } : null,
            advancedData: tile.advancedData ? {
                influences: tile.advancedData.influences.map(influence => ({
                    countryId: influence.countryId,
                    value: influence.value,
                    sources: influence.sources.map(influenceSource => ({
                        provinceId: influenceSource.provinceId,
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
            provinceId: city.provinceId,
            tile: {
                tileId: city.tile.tileId,
                q: city.tile.q,
                r: city.tile.r
            }
        }));
    }


    private enrichTilesLayerData(tiles: Tile[]) {
        const borderCalculator = new TileBorderCalculator(tiles);
        tiles.forEach(tile => this.enrichTileLayerData(tile, borderCalculator));
    }

    private enrichTileLayerData(tile: Tile, borderCalculator: TileBorderCalculator) {
        tile.layers = [
            {
                layerName: "country",
                value: this.getTileCountryLayerValue(tile),
                borderDirections: this.getTileCountryLayerBorders(tile, borderCalculator)
            },
            {
                layerName: "province",
                value: this.getTileProvinceLayerValue(tile),
                borderDirections: this.getTileProvinceLayerBorders(tile, borderCalculator)
            },
            {
                layerName: "city",
                value: this.getTileCityLayerValue(tile),
                borderDirections: this.getTileCityLayerBorders(tile, borderCalculator)
            },
        ];
    }

    private getTileCountryLayerValue(tile: Tile): number {
        return -1;//orDefault(tile.generalData?.owner?.countryId, -1);
    }

    private getTileCountryLayerBorders(tile: Tile, borderCalculator: TileBorderCalculator): boolean[] {
        return borderCalculator.getBorderDirections(tile.position.q, tile.position.r, tile => tile.generalData?.owner?.countryId);
    }

    private getTileProvinceLayerValue(tile: Tile): number {
        return -1;//orDefault(tile.generalData?.owner?.countryId, -1);
    }

    private getTileProvinceLayerBorders(tile: Tile, borderCalculator: TileBorderCalculator): boolean[] {
        return borderCalculator.getBorderDirections(tile.position.q, tile.position.r, tile => tile.generalData?.owner?.provinceId);
    }

    private getTileCityLayerValue(tile: Tile): number {
        return -1;//orDefault(tile.generalData?.owner?.countryId, -1);
    }

    private getTileCityLayerBorders(tile: Tile, borderCalculator: TileBorderCalculator): boolean[] {
        return borderCalculator.getBorderDirections(tile.position.q, tile.position.r, tile => tile.generalData?.owner?.cityId);
    }


}