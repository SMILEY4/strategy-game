import {AppConfig} from "../../main";


export class MessageHandler {

    onMessage(type: string, payload: any): void {
        console.log("Received message", type, payload);
        if (type === "world-state") {
            this.onWorldState(payload);
        }
    }

    onWorldState(payload: WorldStatePayload) {
        AppConfig.turnUpdateWorldState.perform(
            MessageHandler.extractTiles(payload),
            MessageHandler.extractMarkers(payload)
        );
    }

    private static extractTiles(payload: WorldStatePayload): ({
        q: number,
        r: number,
        tileId: number
    })[] {
        return payload.game.tiles.map(tile => ({
            q: tile.q,
            r: tile.r,
            tileId: ["WATER", "LAND"].indexOf(tile.type)
        }));
    }

    private static extractMarkers(payload: WorldStatePayload): ({
        q: number,
        r: number,
        userId: string
    })[] {

        return payload.game.markers.map(marker => {
            const tile = payload.game.tiles.find(t => t.id == marker.tileId);
            return {
                q: tile ? tile.q : 999999,
                r: tile ? tile.r : 999999,
                userId: marker.playerId
            };
        });
    }
}


interface WorldStatePayload {
    game: {
        tiles: ({
            id: string,
            type: string,
            q: number,
            r: number,
        })[],
        markers: ({
            id: string,
            tileId: string,
            playerId: string,
        })[],
        cities: ({
            id: string,
            tileId: string
        })[]
    };
}
