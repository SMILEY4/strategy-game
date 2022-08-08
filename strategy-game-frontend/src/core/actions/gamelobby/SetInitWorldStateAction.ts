import {LocalGameStateAccess} from "../../../external/state/localgame/localGameStateAccess";
import {GameStateAccess} from "../../../external/state/game/gameStateAccess";
import {MsgMarkerTileContent} from "../../../models/messaging/messagingTileContent";
import {PayloadInitGameState} from "../../../models/messaging/payloadInitGameState";
import {City} from "../../../models/state/city";
import {GameState} from "../../../models/state/gameState";
import {Marker} from "../../../models/state/marker";
import {TerrainType} from "../../../models/state/terrainType";
import {Tile} from "../../../models/state/tile";

/**
 * Set the initial world/game state
 */
export class SetInitWorldStateAction {

    private readonly gameStateAccess: LocalGameStateAccess;
    private readonly worldStateAccess: GameStateAccess;

    constructor(gameStateAccess: LocalGameStateAccess, worldStateAccess: GameStateAccess) {
        this.gameStateAccess = gameStateAccess;
        this.worldStateAccess = worldStateAccess;
    }

    perform(state: PayloadInitGameState): void {
        console.log("set initial game state")

        const markers: Marker[] = [];
        const cities: City[] = [];
        const tiles: Tile[] = state.game.tiles.map(t => {
            const tile: Tile = {
                position: {
                    q: t.position.q,
                    r: t.position.r
                },
                terrainType: t.data.terrainType === "LAND" ? TerrainType.LAND : TerrainType.WATER
            };
            t.content.forEach(c => {
                if (c.type === "city") {
                    cities.push({
                        tile: tile
                    });
                }
                if (c.type === "marker") {
                    markers.push({
                        tile: tile,
                        countryId: (c as MsgMarkerTileContent).countryId
                    });
                }
            });
            return tile;
        });

        this.worldStateAccess.setTiles(tiles);
        this.worldStateAccess.setMarkers(markers);
        this.worldStateAccess.setCities(cities);
        this.worldStateAccess.setCurrentTurn(state.game.game.turn);
        this.gameStateAccess.setCurrentState(GameState.PLAYING);
    }

}