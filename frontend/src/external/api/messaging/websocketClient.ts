import {HttpClient} from "../http/httpClient";

export class WebsocketClient {

    private readonly baseUrl: string;
    private websocket: WebSocket | null = null;
    private httpClient: HttpClient;

    constructor(httpClient: HttpClient, baseUrl: string) {
        this.httpClient = httpClient;
        this.baseUrl = baseUrl;
    }


    open(url: string, token: string, consumer: (msg: WebsocketMessage) => void): Promise<void> {
        if (this.isOpen()) {
            return Promise.reject("Websocket is already open");
        }
        return Promise.resolve()
            .then(() => this.httpClient.get({
                url: "/api/session/wsticket",
                requireAuth: true,
                token: token
            }))
            .then(response => response.text())
            .then(ticket => {
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