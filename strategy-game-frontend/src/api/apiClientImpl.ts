import {HttpClient} from "./clients/httpClient";
import {WebsocketClient} from "./clients/websocketClient";
import {MessageHandler} from "./messageHandler";
import {ApiClient} from "../core/ports/required/apiClient";
import {WorldMeta} from "../state/models/WorldMeta";
import {PlaceMarkerCommand} from "../state/models/PlaceMarkerCommand";
import {UserAuthData} from "../state/models/UserAuthData";


const BASE_URL = import.meta.env.PUB_BACKEND_URL;
const BASE_WS_URL = import.meta.env.PUB_BACKEND_WEBSOCKET_URL;


export class ApiClientImpl implements ApiClient {

	private static readonly WS_NAME_WORLD: string = "ws-world";
	private readonly httpClient = new HttpClient(BASE_URL);
	private readonly wsClient = new WebsocketClient(BASE_WS_URL);
	private readonly msgHandler = new MessageHandler();


	public login(email: String, password: String): Promise<UserAuthData> {
		return this.httpClient.post("/api/user/login", {
			email: email,
			password: password
		})
			.then(response => response.json())
			.then(data => ({idToken: data.idToken, refreshToken: data.refreshToken}));
	}


	public signUp(email: String, password: String, username: String): Promise<void> {
		return this.httpClient.post("/api/user/signup", {
			email: email,
			password: password,
			username: username
		}).then(() => undefined);
	}


	public createWorld(): Promise<WorldMeta> {
		return this.httpClient.post("/api/world/create")
			.then(response => response.json())
			.then(data => ({worldId: data.worldId}))
			.catch(() => {
				throw new Error("Error creating world");
			});
	}


	public openWorldConnection(): Promise<void> {
		return this.wsClient.open(ApiClientImpl.WS_NAME_WORLD, "/api/world/messages", (msg) => {
			this.msgHandler.onMessage(msg.type, msg.payload);
		});
	}


	public sendJoinWorld(worldId: string, playerName: string) {
		this.wsClient.send(ApiClientImpl.WS_NAME_WORLD, {
			type: "join-world",
			payload: JSON.stringify({worldId: worldId, playerName: playerName}, null, "   ")
		});
	}


	public submitTurn(worldId: string, playerCommands: PlaceMarkerCommand[]): void {
		this.wsClient.send(ApiClientImpl.WS_NAME_WORLD, {
			type: "submit-turn",
			payload: JSON.stringify({worldId: worldId, commands: playerCommands}, null, "   ")
		});
	}
}