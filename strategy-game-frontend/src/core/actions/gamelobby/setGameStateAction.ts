import {GameStateAccess} from "../../../external/state/game/gameStateAccess";
import {LocalGameStateAccess} from "../../../external/state/localgame/localGameStateAccess";
import {MsgMarkerTileContent} from "../../../models/messaging/messagingTileContent";
import {MsgGameState} from "../../../models/messaging/msgGameState";
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

    perform(game: MsgGameState): void {
        console.log("set game state");
        const countryColors = this.generateCountryColors(game);
        const countries = this.getCountries(game, countryColors);
        const tiles = this.getTiles(game, countryColors);
        this.calculateBordersAction.perform(tiles);
        this.gameStateAccess.setCountries(countries);
        this.gameStateAccess.setProvinces(this.getProvinces(game));
        this.gameStateAccess.setTiles(tiles);
        this.gameStateAccess.setMarkers(this.getMarkers(game));
        this.gameStateAccess.setCities(this.getCities(game));
        this.gameStateAccess.setCurrentTurn(game.turn);
        this.localGameStateAccess.clearCommands();
        this.localGameStateAccess.setCurrentState(GameState.PLAYING);
    }


    private generateCountryColors(game: MsgGameState): ([string, CountryColor])[] {
        return game.countries
            .map(country => country.countryId)
            .sort()
            .map((id, index) => [id, ALL_COUNTRY_COLORS[index % ALL_COUNTRY_COLORS.length]]);
    }


    private getCountries(game: MsgGameState, colors: ([string, CountryColor])[]): Country[] {
        return game.countries.map(country => ({
            countryId: country.countryId,
            userId: country.userId,
            resources: {
                money: country.resources.money
            },
            color: (colors.find(color => color[0] === country.countryId)!!)[1] as CountryColor
        }));
    }


    private getProvinces(game: MsgGameState): Province[] {
        return game.provinces.map(province => ({
            provinceId: province.provinceId,
            countryId: province.countryId,
        }));
    }


    private getTiles(game: MsgGameState, colors: ([string, CountryColor])[]): Tile[] {
        return game.tiles.map(tile => ({
            tileId: tile.tileId,
            position: {
                q: tile.position.q,
                r: tile.position.r
            },
            influences: tile.influences.map(influence => ({
                countryId: influence.countryId,
                value: influence.value,
                sources: influence.sources.map(influenceSource => ({
                    provinceId: influenceSource.provinceId,
                    cityId: influenceSource.cityId,
                    value: influenceSource.value
                }))
            })),
            terrainType: tile.data.terrainType === "LAND" ? TerrainType.LAND : TerrainType.WATER,
            owner: tile.owner ? {
                countryId: tile.owner?.countryId,
                countryColor: (colors.find(color => color[0] === tile.owner?.countryId)!!)[1] as CountryColor,
                provinceId: tile.owner?.provinceId,
                cityId: tile.owner.cityId,
            } : null,
            borderData: []
        }));
    }


    private getMarkers(game: MsgGameState): Marker[] {
        const markers: Marker[] = [];
        game.tiles.forEach(tile => {
            tile.content.forEach(content => {
                if (content.type === "marker") {
                    markers.push({
                        tile: {
                            tileId: tile.tileId,
                            q: tile.position.q,
                            r: tile.position.r
                        },
                        countryId: (content as MsgMarkerTileContent).countryId
                    });
                }
            });
        });
        return markers;
    }


    private getCities(game: MsgGameState): City[] {
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