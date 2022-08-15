import {GameStateAccess} from "../../../external/state/game/gameStateAccess";
import {LocalGameStateAccess} from "../../../external/state/localgame/localGameStateAccess";
import {MsgMarkerTileContent} from "../../../models/messaging/messagingTileContent";
import {PayloadInitGameState} from "../../../models/messaging/payloadInitGameState";
import {City} from "../../../models/state/city";
import {ALL_COUNTRY_COLORS, Country, CountryColor} from "../../../models/state/country";
import {GameState} from "../../../models/state/gameState";
import {Marker} from "../../../models/state/marker";
import {Province} from "../../../models/state/Province";
import {TerrainType} from "../../../models/state/terrainType";
import {Tile} from "../../../models/state/tile";

/**
 * Set the initial world/game state
 */
export class SetInitWorldStateAction {

    private readonly localGameStateAccess: LocalGameStateAccess;
    private readonly gameStateAccess: GameStateAccess;

    constructor(localGameStateAccess: LocalGameStateAccess, gameStateAccess: GameStateAccess) {
        this.localGameStateAccess = localGameStateAccess;
        this.gameStateAccess = gameStateAccess;
    }

    perform(state: PayloadInitGameState): void {
        console.log("set initial game state");

        const countryColors = state.game.countries
            .map(c => c.countryId)
            .sort()
            .map((id, index) => [id, ALL_COUNTRY_COLORS[index % ALL_COUNTRY_COLORS.length]]);

        const countries: Country[] = state.game.countries.map(country => ({
            countryId: country.countryId,
            userId: country.userId,
            resources: {
                money: country.resources.money
            },
            color: (countryColors.find(e => e[0] === country.countryId)!!)[1] as CountryColor
        }));

        const provinces: Province[] = state.game.provinces.map(province => ({
            provinceId: province.provinceId,
            countryId: province.countryId,
        }));

        const markers: Marker[] = [];
        const tiles: Tile[] = state.game.tiles.map(t => {
            const tile: Tile = {
                tileId: t.tileId,
                position: {
                    q: t.position.q,
                    r: t.position.r
                },
                influences: t.influences.map(i => ({
                    country: countries.find(c => c.countryId === i.countryId)!!,
                    value: i.value,
                    sources: i.sources.map(is => ({
                        province: provinces.find(p => p.provinceId === is.provinceId)!!,
                        cityId: is.cityId,
                        value: is.value
                    }))
                })),
                terrainType: t.data.terrainType === "LAND" ? TerrainType.LAND : TerrainType.WATER,
                owner: t.owner ? {
                    country: countries.find(c => c.countryId === t.owner?.countryId)!!,
                    province: provinces.find(p => p.provinceId === t.owner?.provinceId)!!,
                    cityId: t.owner.cityId,
                } : null
            };
            t.content.forEach(c => {
                if (c.type === "marker") {
                    markers.push({
                        tile: tile,
                        countryId: (c as MsgMarkerTileContent).countryId
                    });
                }
            });
            return tile;
        });

        const cities: City[] = state.game.cities.map(city => ({
            cityId: city.cityId,
            name: city.name,
            country: countries.find(c => c.countryId === city.countryId)!!,
            province: provinces.find(p => p.provinceId === city.provinceId)!!,
            tile: tiles.find(t => t.position.q === city.tile.q && t.position.r === city.tile.r)!!
        }));

        this.gameStateAccess.setCountries(countries);
        this.gameStateAccess.setTiles(tiles);
        this.gameStateAccess.setMarkers(markers);
        this.gameStateAccess.setCities(cities);
        this.gameStateAccess.setCurrentTurn(state.game.turn);
        this.localGameStateAccess.setCurrentState(GameState.PLAYING);
    }

}