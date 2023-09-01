export interface WebsocketMessageHandler {
    onMessage: (type: string, payload: any) => void;
}

export namespace WebsocketMessageHandler {

    export const NOOP = {
        onMessage: () => undefined
    }

}