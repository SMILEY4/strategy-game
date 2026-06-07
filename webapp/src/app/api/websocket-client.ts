import { AppError } from "@app/api/app-error.ts";

interface WebsocketConnectionConfig<TServerMessage, TClientMessage> {
    url: string;
    key?: string;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: () => void;
    onMessage?: (message: TServerMessage, handle: WebsocketConnectionHandle<TClientMessage>) => void;
}

export interface WebsocketConnectionHandle<TClientMessage> {
    key: string;
    close: () => void;
    send: (message: TClientMessage) => void;
}

interface ActiveConnection {
    key: string;
    socket: WebSocket;
    buffer: string[];
}

export interface WebsocketClient {
    open: <TServerMessage, TClientMessage>(config: WebsocketConnectionConfig<TServerMessage, TClientMessage>) => WebsocketConnectionHandle<TClientMessage>;
    send: <TClientMessage>(key: string, message: TClientMessage) => void;
    close: (key: string) => void;
}

interface Dependencies {
    baseUrl: string;
}

/*
USAGE:

    type ServerMessage =
        | { type: "PING" }
        | { type: "PONG" }


    type ClientMessage =
        | { type: "PING" }
        | { type: "PONG" }

    const connection = client.open<ServerMessage, ClientMessage>({
        url: "ws://localhost:3000/pingpong",
        key: "pingpong",
        onOpen: () => {
            console.log("opened pingpong connection")
        },
        onClose: () => {
            console.log("closed pingpong connection")
        },
        onError: () => {
            console.log("error with pingpong connection")
        },
        onMessage: (message, handle) => {
            console.log("received message", message)
            handle.send({ type: "PONG"})
            handle.close()
        }
    })

    connection.send({ type: "PING" })
    connection.close()

    client.send<ClientMessage>("pingpong", { type: "PING"})
    client.close("pingpong")

 */
export const websocketClient = ({ baseUrl }: Dependencies): WebsocketClient => {
    const connections = new Map<string, ActiveConnection>();

    function closeConnection(key: string) {
        const connection = connections.get(key);
        if (!connection) {
            console.warn("Could not close connection: already closed / not found", key);
            return;
        }
        connection.socket.close();
    }

    function sendMessage(key: string, message: unknown) {
        const connection = connections.get(key);
        if (!connection) {
            console.warn("Could not send message: connection not found", key);
            return;
        }

        const serializedMessage = JSON.stringify(message);

        if (connection.socket.readyState === WebSocket.CONNECTING) {
            connection.buffer.push(serializedMessage);
            return;
        }

        if (connection.socket.readyState !== WebSocket.OPEN) {
            console.warn(`Could not send message: connection '${key}' is dead or closing (readyState: ${connection.socket.readyState})`);
            return;
        }

        connection.socket.send(serializedMessage);
    }

    function flushBuffer(connection: ActiveConnection) {
        while (connection.buffer.length > 0 && connection.socket.readyState === WebSocket.OPEN) {
            const message = connection.buffer.shift();
            if (message !== undefined) {
                connection.socket.send(message);
            }
        }
    }

    return {
        open: <TServerMessage, TClientMessage>(config: WebsocketConnectionConfig<TServerMessage, TClientMessage>): WebsocketConnectionHandle<TClientMessage> => {
            const key = config.key ?? config.url;

            if (connections.has(key)) {
                throw new AppError({
                    errorCode: "WS_CONNECTION_ALREADY_OPEN",
                    title: "Websocket Connection already open",
                    detail: "A websocket connection with the given key is already open",
                    context: { key },
                });
            }

            const absoluteUrl = baseUrl.endsWith('/') || config.url.startsWith('/')
                ? `${baseUrl}${config.url}`
                : `${baseUrl}/${config.url}`;

            const socket = new WebSocket(absoluteUrl);

            const connectionRecord: ActiveConnection = {
                key,
                socket,
                buffer: []
            };

            const handle: WebsocketConnectionHandle<TClientMessage> = {
                key,
                close: () => closeConnection(key),
                send: (message: TClientMessage) => sendMessage(key, message),
            }

            socket.onopen = () => {
                flushBuffer(connectionRecord);
                config.onOpen?.();
            };

            socket.onerror = () => {
                config.onError?.();
            };

            socket.onclose = () => {
                connections.delete(key);
                config.onClose?.();
                socket.onopen = null;
                socket.onerror = null;
                socket.onclose = null;
                socket.onmessage = null;
            };

            socket.onmessage = (event) => {
                try {
                    const parsedData = JSON.parse(event.data);
                    config.onMessage?.(parsedData, handle);
                } catch (err) {
                    console.error(`Failed to parse WebSocket message on key [${key}]:`, err);
                }
            };

            connections.set(key, connectionRecord);

            return handle;
        },

        send: <TClientMessage>(key: string, message: TClientMessage): void => {
            sendMessage(key, message);
        },

        close: (key: string): void => {
            closeConnection(key);
        },
    };
};