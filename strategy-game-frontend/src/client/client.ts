import {MessageHandler} from "../core/messageHandler";
import {BaseClient} from "./baseClient";

const BASE_URL = import.meta.env.PUB_BACKEND_URL;
const BASE_WS_URL = import.meta.env.PUB_BACKEND_WEBSOCKET_URL;

/**
 * Information about a world
 */
export interface WorldMeta {
	worldId: string;
}


export class Client extends BaseClient {

	messageHandler = new MessageHandler();

	constructor() {
		super(BASE_URL, `${BASE_WS_URL}/api/world/messages`);
	}

	/**
	 * Send a request to create new world
	 * @return information about the created world
	 */
	public createWorld(): Promise<WorldMeta> {
		return this.post(`${BASE_URL}/api/world/create`)
			.then(response => response.json())
			.then(data => ({worldId: data.worldId}))
			.catch(() => {
				throw new Error("Error creating world");
			});
	}

	/**
	 * Send a request to join a world. The websocket-connection must be opened before
	 * @param worldId the id of the world
	 */
	public joinWorld(worldId: string) {
		if (this.isWebsocketOpen()) {
			this.websocket?.send(JSON.stringify({
				type: "join-world",
				payload: JSON.stringify({
					worldId: worldId
				}, null, "   ")
			}, null, "   "));
		} else {
			throw new Error("Websocket is closed.");
		}
	}


	/**
	 * Open a new websocket-connection for world messages. Closes all other connections.
	 */
	public openWorldMessageConnection(): Promise<void> {
		return this.openWebsocket((msg: string) => {
			const messageData = JSON.parse(msg);
			this.messageHandler.onMessage(messageData.type, messageData.payload);
		});
	}


}

export const CLIENT = new Client();
