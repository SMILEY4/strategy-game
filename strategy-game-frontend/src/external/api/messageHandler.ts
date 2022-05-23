import {AppConfig} from "../../main";

export class MessageHandler {

    onMessage(type: string, payload: any): void {
        console.log("Received message", type, payload);
        if (type === "world-state") {
            this.onWorldState(payload);
        }
    }

    onWorldState(payload: PayloadWorldState) {
        AppConfig.turnUpdateWorldState.perform(payload.world.map.tiles, payload.world.markers);
    }

}


interface PayloadWorldState {
    world: {
        map: {
            tiles: ({
                q: number,
                r: number,
                tileId: number
            })[]
        },
        markers: ({
            q: number,
            r: number,
            userId: string
        })[]
    };
}