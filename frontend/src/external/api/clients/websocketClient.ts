
export class WebsocketClient {

    private readonly baseUrl: string;
    private websocket: WebSocket | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }


    open(url: string, ticket: string, consumer: (msg: WebsocketMessage) => void): Promise<void> {
        if (this.isOpen()) {
            return Promise.reject("Websocket is already open");
        }
        return new Promise((resolve, reject) => {
            try {
                const ws = new WebSocket(this.baseUrl + url + "?ticket=" + ticket);
                ws.onopen = () => resolve();
                ws.onclose = () => this.close();
                ws.onmessage = (e: MessageEvent) => consumer(JSON.parse(e.data));
                this.websocket = ws;
            } catch (e) {
                reject(e);
            }
        });
    }


    close() {
        if (this.isOpen() && this.websocket) {
            this.websocket.onclose = null;
            this.websocket.close();
        }
        this.websocket = null;
    }


    send(type: string, payload: any) {
        if (this.isOpen() && this.websocket) {
            const message: WebsocketMessage = {
                type: type,
                payload: payload
            };
            this.websocket.send(JSON.stringify(message, null, "   "));
        }
    }


    isOpen(): boolean {
        return this.websocket != null && this.websocket.readyState === WebSocket.OPEN;
    }

}


export interface WebsocketMessage {
    type: string,
    payload: string
}