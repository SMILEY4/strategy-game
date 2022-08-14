import {GameStateAccess} from "../../../external/state/game/gameStateAccess";
import {LocalGameStateAccess} from "../../../external/state/localgame/localGameStateAccess";
import {MsgMarkerTileContent} from "../../../models/messaging/messagingTileContent";
import {PayloadInitTurnState} from "../../../models/messaging/payloadInitTurnState";
import {City} from "../../../models/state/city";
import {ALL_COUNTRY_COLORS, Country, CountryColor} from "../../../models/state/country";
import {GameState} from "../../../models/state/gameState";
import {Marker} from "../../../models/state/marker";
import {TerrainType} from "../../../models/state/terrainType";
import {Tile} from "../../../models/state/tile";

/**
 * Update the world/game state after a resolved turn
 */
export class TurnUpdateWorldStateAction {

    private readonly localGameStateAccess: LocalGameStateAccess;
    private readonly gameStateAccess: GameStateAccess;

    constructor(localGameStateAccess: LocalGameStateAccess, gameStateAccess: GameStateAccess) {
        this.localGameStateAccess = localGameStateAccess;
        this.gameStateAccess = gameStateAccess;
    }

    perform(state: PayloadInitTurnState): void {
        console.log("update world state");

        const countryColors = state.game.countries
            .map(c => c._key)
            .sort()
            .map((id, index) => [id, ALL_COUNTRY_COLORS[index % ALL_COUNTRY_COLORS.length]]);

        const countries: Country[] = state.game.countries.map(country => ({
            countryId: country._key,
            userId: country.userId,
            resources: {
                money: country.resources.money
            },
            color: (countryColors.find(e => e[0] === country._key)!!)[1] as CountryColor
        }));

        const markers: Marker[] = [];
        const tiles: Tile[] = state.game.tiles.map(t => {
            const tile: Tile = {
                tileId: t._key,
                position: {
                    q: t.position.q,
                    r: t.position.r
                },
                terrainType: t.data.terrainType === "LAND" ? TerrainType.LAND : TerrainType.WATER
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
            cityId: city._key,
            name: city.name,
            country: countries.find(c => c.countryId === city.countryId)!!,
            tile: tiles.find(t => t.position.q === city.tile.q && t.position.r === city.tile.r)!!
        }));

        this.gameStateAccess.setCountries(countries);
        this.gameStateAccess.setTiles(tiles);
        this.gameStateAccess.setMarkers(markers);
        this.gameStateAccess.setCities(cities);
        this.gameStateAccess.setCurrentTurn(state.game.game.turn);
        this.localGameStateAccess.clearCommands();
        this.localGameStateAccess.setCurrentState(GameState.PLAYING);
    }

}