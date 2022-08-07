import {AppConfig} from "../../main";
import {InitialWorldStateMessagePayload, MarkerTileContent} from "../../models/initialWorldStateMessagePayload";
import {TurnResultMessagePayload} from "../../models/TurnResultMessagePayload";


export class MessageHandler {

    onMessage(type: string, payload: any): void {
        console.log("Received message", type, payload);
        if (type === "world-state") {
            this.onWorldState(payload);
        }
        if (type === "turn-result") {
            this.onTurnResult(payload);
        }
    }

    onWorldState(payload: InitialWorldStateMessagePayload) {
        const tiles = payload.game.tiles.map(tile => ({
            tileId: tile.data.terrainType === "LAND" ? 1 : 0,
            q: tile.position.q,
            r: tile.position.r
        }));
        const markers = payload.game.tiles.flatMap(tile => {
            return tile.content.filter(content => content.type === "marker").map(marker => ({
                q: tile.position.q,
                r: tile.position.r,
                userId: (marker as MarkerTileContent).countryId
            }));
        });
        const cities = payload.game.tiles.flatMap(tile => {
            return tile.content.filter(content => content.type === "city").map(() => ({
                q: tile.position.q,
                r: tile.position.r,
            }));
        });
        AppConfig.turnUpdateWorldState.perform(tiles, markers, cities);
    }

    onTurnResult(payload: TurnResultMessagePayload) {
        const tiles = payload.game.tiles.map(tile => ({
            tileId: tile.data.terrainType === "LAND" ? 1 : 0,
            q: tile.position.q,
            r: tile.position.r
        }));
        const markers = payload.game.tiles.flatMap(tile => {
            return tile.content.filter(content => content.type === "marker").map(marker => ({
                q: tile.position.q,
                r: tile.position.r,
                userId: (marker as MarkerTileContent).countryId
            }));
        });
        const cities = payload.game.tiles.flatMap(tile => {
            return tile.content.filter(content => content.type === "city").map(() => ({
                q: tile.position.q,
                r: tile.position.r,
            }));
        });
        AppConfig.turnUpdateWorldState.perform(tiles, markers, cities);
    }

}