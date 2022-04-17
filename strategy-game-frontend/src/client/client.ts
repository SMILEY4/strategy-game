import {MessageHandler} from "../core/messageHandler";

export namespace Client {

	const BASE_URL = import.meta.env.PUB_BACKEND_URL;
	const BASE_WS_URL = import.meta.env.PUB_BACKEND_WEBSOCKET_URL;

	const messageHandler = new MessageHandler();
	let websocket: WebSocket | null = null;


	/**
	 * Information about a world
	 */
	export interface WorldMeta {
		worldId: string;
	}


	/**
	 * Send a request to create new world
	 * @return information about the created world
	 */
	export function createWorld(): Promise<WorldMeta> {
		return post(`${BASE_URL}/api/world/create`)
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
	export function joinWorld(worldId: string) {
		if (isWebsocketOpen()) {
			websocket?.send(JSON.stringify({
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
	 * Open a new websocket-connection for world messages. Closes the last connection if it is still open.
	 */
	export function openWorldMessageConnection(): Promise<void> {
		closeWebSocket();
		return new Promise((resolve, reject) => {
			try {
				websocket = new WebSocket(`${BASE_WS_URL}/api/world/messages`);
				websocket.onopen = () => resolve();
				websocket.onclose = () => closeWebSocket();
				websocket.onmessage = (e: MessageEvent) => {
					const message = JSON.parse(e.data);
					messageHandler.onMessage(message.type, message.payload);
				}
			} catch (e) {
				reject(e);
			}
		});
	}


	/**
	 * Close the (open) websocket-connection
	 */
	export function closeWebSocket() {
		if (isWebsocketOpen()) {
			websocket?.close();
		}
		websocket = null;
	}


	/**
	 * @return whether the websocket-connection is open
	 */
	export function isWebsocketOpen() {
		return websocket !== null && websocket.readyState === WebSocket.OPEN;
	}


	/**
	 * Perform a "GET"-request
	 * @param url the url
	 */
	function get(url: string): Promise<Response> {
		return fetch(url);
	}


	/**
	 * Perform a "POST"-request
	 * @param url the url
	 * @param content the content (optional)
	 */
	function post(url: string, content?: object): Promise<Response> {
		return fetch(url, {
				method: "POST",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				body: (content !== undefined && content != null)
					? JSON.stringify(content, null, "   ")
					: undefined
			}
		);
	}


}