import {DISTRIBUTOR} from "../main";

export class MessageHandler {

	public onMessage(type: string, payload: string) {
		console.log("[received message]:", type);
		if (type === "world-state") {
			DISTRIBUTOR.setInitialWorldState(JSON.parse(payload));
		}
	}

}