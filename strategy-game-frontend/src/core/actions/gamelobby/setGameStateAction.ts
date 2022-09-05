import {GameStateAccess} from "../../../external/state/game/gameStateAccess";
import {LocalGameStateAccess} from "../../../external/state/localgame/localGameStateAccess";
import {MsgMarkerTileContent} from "../../../models/messaging/messagingTileContent";
import {PayloadGameState} from "../../../models/messaging/payloadGameState";
import {City} from "../../../models/state/city";
import {ALL_COUNTRY_COLORS, Country, CountryColor} from "../../../models/state/country";
import {GameState} from "../../../models/state/gameState";
import {Marker} from "../../../models/state/marker";
import {Province} from "../../../models/state/Province";
import {TerrainType} from "../../../models/state/terrainType";
import {Tile} from "../../../models/state/tile";
import {BordersCalculateAction} from "../border/bordersCalculateAction";

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
        const countryColors = this.generateCountryColors(game);
        const countries = this.getCountries(game, countryColors);
        const tiles = this.getTiles(game, countryColors);
        this.calculateBordersAction.perform(tiles);
        this.gameStateAccess.setState(
            game.turn,
            tiles,
            countries,
            this.getProvinces(game),
            this.getCities(game),
            this.getMarkers(game)
        );
        this.localGameStateAccess.clearCommands();
        this.localGameStateAccess.setCurrentState(GameState.PLAYING);
    }


    private generateCountryColors(game: PayloadGameState): ([string, CountryColor])[] {
        return game.countries
            .map(country => country.baseData.countryId)
            .sort()
            .map((id, index) => [id, ALL_COUNTRY_COLORS[index % ALL_COUNTRY_COLORS.length]]);
    }


    private getCountries(game: PayloadGameState, colors: ([string, CountryColor])[]): Country[] {
        return game.countries.map(country => ({
            countryId: country.baseData.countryId,
            userId: country.baseData.userId,
            color: (colors.find(color => color[0] === country.baseData.countryId)!!)[1] as CountryColor,
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


    private getTiles(game: PayloadGameState, colors: ([string, CountryColor])[]): Tile[] {
        return game.tiles.map(tile => ({
            tileId: tile.baseData.tileId,
            position: {
                q: tile.baseData.position.q,
                r: tile.baseData.position.r
            },
            visibility: tile.baseData.visibility,
            borderData: [],
            generalData: tile.generalData ? {
                terrainType: tile.generalData.terrainType === "LAND" ? TerrainType.LAND : TerrainType.WATER,
                owner: tile.generalData.owner ? {
                    countryId: tile.generalData.owner?.countryId,
                    countryColor: (colors.find(color => color[0] === tile.generalData?.owner?.countryId)!!)[1] as CountryColor,
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

}