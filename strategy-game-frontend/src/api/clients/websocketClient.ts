export class WebsocketClient {

	private readonly baseUrl: string;
	private readonly websockets = new Map<string, WebSocket>();

	constructor(baseUrl?: string) {
		console.log("CONSTRUCT NEW")
		this.baseUrl = baseUrl ? baseUrl : "";
	}


	/**
	 * Open a new websocket-connection.
	 * @param name the name of the websocket for later identification. If another websocket with the same name is currently open, it will be closed.
	 * @param url the url
	 * @param consumer the function that will be called for received messages
	 */
	public open(name: string, url: string, consumer: (msg: any) => void): Promise<void> {
		console.log("OPEN", name, this.websockets);
		this.close(name);
		return new Promise((resolve, reject) => {
			try {
				const ws = new WebSocket(this.baseUrl + url);
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
		console.log("TRY CLOSE", name, this.websockets);
		if (this.isWebsocketOpen(name)) {
			const ws = this.findWebSocket(name);
			if (ws) {
				console.log("CLOSE", name, this.websockets);
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
		console.log("TRY SEND", name, this.websockets);
		if (this.isWebsocketOpen(name)) {
			const ws = this.findWebSocket(name);
			if (ws) {
				console.log("SEND", name, this.websockets);
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

}
