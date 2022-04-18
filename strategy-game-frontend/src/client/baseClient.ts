export class BaseClient {

	readonly urlApi: string;
	readonly urlWebSocket: string;
	websocket: WebSocket | null = null;

	constructor(apiURL: string, websocketURL: string) {
		this.urlApi = apiURL;
		this.urlWebSocket = websocketURL;
	}


	/**
	 * Open a new websocket-connection. Closes all other connections.
	 */
	public openWebsocket(consumer: (msg: string) => void): Promise<void> {
		this.closeWebSocket();
		return new Promise((resolve, reject) => {
			try {
				this.websocket = new WebSocket(this.urlWebSocket);
				this.websocket.onopen = () => resolve();
				this.websocket.onclose = () => this.closeWebSocket();
				this.websocket.onmessage = (e: MessageEvent) => {
					consumer(e.data);
				};
			} catch (e) {
				reject(e);
			}
		});
	}


	/**
	 * Close the (open) websocket-connection
	 */
	public closeWebSocket() {
		if (this.isWebsocketOpen()) {
			if (this.websocket) {
				this.websocket.onclose = null;
				this.websocket.close();
			}
		}
		this.websocket = null;
	}


	/**
	 * @return whether the websocket-connection is open
	 */
	isWebsocketOpen() {
		return this.websocket !== null && this.websocket.readyState === WebSocket.OPEN;
	}


	/**
	 * Perform a "GET"-request
	 * @param url the url
	 */
	get(url: string): Promise<Response> {
		return fetch(url);
	}


	/**
	 * Perform a "POST"-request
	 * @param url the url
	 * @param content the content (optional)
	 */
	post(url: string, content?: object): Promise<Response> {
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
