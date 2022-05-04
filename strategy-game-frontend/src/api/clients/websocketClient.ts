import {AuthProvider} from "../../core/ports/provided/authProvider";

export class WebsocketClient {

	private readonly baseUrl: string;
	private readonly authProvider: AuthProvider;
	private readonly websockets = new Map<string, WebSocket>();

	constructor(baseUrl: string, authProvider: AuthProvider) {
		this.baseUrl = baseUrl;
		this.authProvider = authProvider;
	}


	/**
	 * Open a new websocket-connection.
	 * @param name the name of the websocket for later identification. If another websocket with the same name is currently open, it will be closed.
	 * @param url the url
	 * @param consumer the function that will be called for received messages
	 */
	public open(name: string, url: string, consumer: (msg: any) => void): Promise<void> {
		this.close(name);
		return new Promise((resolve, reject) => {
			try {
				const ws = new WebSocket(this.baseUrl + url + this.buildQueryParams())
				ws.onopen = () => resolve();
				ws.onclose = () => this.close(name);
				ws.onmessage = (e: MessageEvent) => consumer(JSON.parse(e.data));
				this.websockets.set(name, ws);
			} catch (e) {
				reject(e);
			}
		});
	}


	/**
	 * Close the websocket-connection with the given name.
	 */
	public close(name: string) {
		if (this.isWebsocketOpen(name)) {
			const ws = this.findWebSocket(name);
			if (ws) {
				ws.onclose = null;
				ws.close();
			}
		}
		this.websockets.delete(name);
	}


	/**
	 * Send a mew message via the websocket-connection with the given name.
	 * @param name the name of the websocket-connection
	 * @param data the data to send
	 */
	public send(name: string, data: object) {
		if (this.isWebsocketOpen(name)) {
			const ws = this.findWebSocket(name);
			if (ws) {
				ws.send(JSON.stringify(data, null, "   "));
			}
		} else {
			throw new Error("Cant send data: no open WebSocket with name " + name);
		}
	}


	private isWebsocketOpen(name: string) {
		const ws = this.findWebSocket(name);
		return ws !== null && ws.readyState === WebSocket.OPEN;
	}


	private findWebSocket(name: string): WebSocket | null {
		const ws = this.websockets.get(name);
		return ws ? ws : null;
	}

	private buildQueryParams(): string {
		const jwtToken = this.authProvider.getToken();
		return "?token=" + jwtToken;
	}

}
