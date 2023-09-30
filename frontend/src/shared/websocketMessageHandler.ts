export interface WebsocketMessageHandler {
    onMessage: (type: string, payload: any) => void;
}