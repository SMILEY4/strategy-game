import {Game} from "../core/game";

export class MessageHandler {

	public onMessage(type: string, payload: string) {
		console.log("[received message]:", type);
		if (type === "world-state") {
			Game.world.setWorldState(JSON.parse(payload));
			Game.turn.startNext();
		}
	}

}