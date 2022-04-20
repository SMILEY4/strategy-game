import {HttpClient} from "./clients/httpClient";
import {WebsocketClient} from "./clients/websocketClient";
import {MessageHandler} from "./messageHandler";
import {GlobalState} from "../state/globalState";


/**
 * Information about a world
 */
export interface WorldMeta {
	worldId: string;
}


const BASE_URL = import.meta.env.PUB_BACKEND_URL;
const BASE_WS_URL = import.meta.env.PUB_BACKEND_WEBSOCKET_URL;


export class ApiClient {

	private static readonly WS_NAME_WORLD: string = "ws-world";
	private readonly httpClient = new HttpClient(BASE_URL);
	private readonly wsClient = new WebsocketClient(BASE_WS_URL);
	private readonly msgHandler = new MessageHandler();


	/**
	 * Send a request to create new world
	 * @return information about the created world
	 */
	public createWorld(): Promise<WorldMeta> {
		return this.httpClient.post("/api/world/create")
			.then(response => response.json())
			.then(data => ({worldId: data.worldId}))
			.catch(() => {
				throw new Error("Error creating world");
			});
	}


	/**
	 * Opens a new websocket connection for world-related messages
	 */
	public openWorldConnection(): Promise<void> {
		return this.wsClient.open(ApiClient.WS_NAME_WORLD, "/api/world/messages", (msg) => {
			this.msgHandler.onMessage(msg.type, msg.payload);
		});
	}


	/**
	 * Send a request to join a world. The websocket-connection must be opened before
	 * @param worldId the id of the world
	 */
	public sendJoinWorld(worldId: string) {
		this.wsClient.send(ApiClient.WS_NAME_WORLD, {
			type: "join-world",
			payload: JSON.stringify({worldId: worldId}, null, "   ")
		});
	}


	/**
	 * Submit the commands of the current turn
	 * @param worldId the id of the world
	 * @param playerCommands the commands to submit
	 */
	public submitTurn(worldId: string, playerCommands: GlobalState.PlaceMarkerCommand[]): void {
		this.wsClient.send(ApiClient.WS_NAME_WORLD, {
			type: "submit-turn",
			payload: JSON.stringify({worldId: worldId, commands: playerCommands}, null, "   ")
		});
	}
}