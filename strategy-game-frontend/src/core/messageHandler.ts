import {GameState} from "../state/gameState";

export class MessageHandler {

	public onMessage(data: any) {
		console.log("received message:", data)

		if(data.messageType === "send-world-state") {
			const tiles = data.payload;
			GameState.useState.setState(() => ({
				initialized: true,
				map: tiles
			}))
		}

	}

}