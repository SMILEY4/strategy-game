import {Game} from "../core/game";

export class MessageHandler {

	public onMessage(type: string, payload: string) {
		console.log("[received message]:", type);
		if (type === "world-state") {
			Game.world.setInitialState(JSON.parse(payload));
		}
		if (type === "new-turn") {
			Game.turn.startNext(JSON.parse(payload).addedMarkers);
		}
	}

}