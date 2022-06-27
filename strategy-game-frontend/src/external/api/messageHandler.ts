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
        return payload.tiles.map(tile => ({
            q: tile.q,
            r: tile.r,
            tileId: ["PLAINS", "WATER", "MOUNTAINS"].indexOf(tile.data.type)
        }));
    }

    private static extractMarkers(payload: WorldStatePayload): ({
        q: number,
        r: number,
        userId: string
    })[] {
        return payload.tiles.flatMap(tile => {
            const entities: ({ q: number, r: number, userId: string })[] = [];
            tile.entities.filter(e => e.entityType === "MARKER").forEach(e => {
                entities.push({
                    q: tile.q,
                    r: tile.r,
                    userId: e.userId
                });
            });
            return entities;
        });
    }
}


interface WorldStatePayload {
    tiles: ({
        q: number,
        r: number,
        data: {
            type: string
        },
        entities: ({
            entityType: string,
            userId: string
        })[]
    })[];
}
