/**
 * Handles a single websocket connection
 */
export class HttpWebsocketClient {

    private websocket: WebSocket | null = null;

    constructor(private readonly baseUrl: string) {
    }

    open(path: string, consumer: (message: unknown) => void): Promise<void> {
        console.debug("Opening websocket connection", path);

        // close existing connection before opening new one
        if (this.isOpen()) {
            this.close();
        }

        // build full url
        const fullUrl = (this.baseUrl.endsWith("/") || path.startsWith("/"))
            ? this.baseUrl + path
            : this.baseUrl + "/" + path;

        // create websocket connection
        return new Promise<void>((resolve, reject) => {
            try {

                const ws = new WebSocket(fullUrl);
                ws.onopen = () => resolve();
                ws.onclose = () => this.close();
                ws.onerror = (e) => reject(e);

                ws.onmessage = (message: MessageEvent) => {
                    try {
                        consumer(JSON.parse(message.data));
                    } catch (e) {
                        console.error("Could not parse websocket message as json", e, message.data);
                    }
                };

                this.websocket = ws;
            } catch (e) {
                reject(e);
            }
        });
    }

    isOpen(): boolean {
        return !!this.websocket && this.websocket.readyState === WebSocket.OPEN;
    }

    close() {
        if (this.isOpen() && this.websocket) {
            console.debug("Closing websocket connection", this.websocket?.url);
            this.websocket.onclose = null;
            this.websocket.close();
        }
        this.websocket = null;
    }

    send(message: any) {
        if (this.isOpen()) {
            this.websocket?.send(JSON.stringify(message, null, "  "));
        }
    }


}