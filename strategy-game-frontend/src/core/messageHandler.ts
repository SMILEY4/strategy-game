import {GameState} from "../state/gameState";

export class MessageHandler {

	public onMessage(type: string, payload: string) {
		console.log("received message:", type);
		if (type === "world-state") {
			const worldState = JSON.parse(payload);
			GameState.useState.setState(() => ({
				initialized: true,
				map: worldState.map.tiles
			}));
		}

	}

}