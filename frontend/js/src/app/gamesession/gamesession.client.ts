import {Game} from "../../models/misc/game";
import {HttpErrorCodes} from "../http/http.status-codes";
import {DetailedError, HttpErrorResponseBody} from "../../common/detailedError";
import {App} from "../../appContext";
import {authHandlerUserAuthToken} from "../authentication/auth.handler.user-auth-token";

export namespace GameSessionClientTypes {

    //==== LIST GAMES ==============================

    const listGamesErrorCodeValues = ["todo"] as const;

    export type ListGamesErrorCodes = typeof listGamesErrorCodeValues[number];

    export function isListGamesError(err: unknown): err is DetailedError<ListGamesErrorCodes> {
        return err instanceof DetailedError && listGamesErrorCodeValues.includes(err.errorCode);
    }

    //==== CREATE GAME =============================

    const createGameErrorCodeValues = ["todo"] as const;

    export type CreateGameErrorCodes = typeof createGameErrorCodeValues[number];

    export function isCreateGameError(err: unknown): err is DetailedError<CreateGameErrorCodes> {
        return err instanceof DetailedError && createGameErrorCodeValues.includes(err.errorCode);
    }

    //==== DELETE GAME =============================

    const deleteGameErrorCodeValues = ["todo"] as const;

    export type DeleteGameErrorCodes = typeof deleteGameErrorCodeValues[number];

    export function isDeleteGameError(err: unknown): err is DetailedError<DeleteGameErrorCodes> {
        return err instanceof DetailedError && deleteGameErrorCodeValues.includes(err.errorCode);
    }

    //==== JOIN GAME ===============================

    const joinGameErrorCodeValues = ["todo"] as const;

    export type JoinGameErrorCodes = typeof joinGameErrorCodeValues[number];

    export function isJoinGameError(err: unknown): err is DetailedError<JoinGameErrorCodes> {
        return err instanceof DetailedError && joinGameErrorCodeValues.includes(err.errorCode);
    }

    //==== WEBSOCKET TICKET ========================

    const getWsTicketErrorCodeValues = ["todo"] as const;

    export type GetWsTicketErrorCodes = typeof getWsTicketErrorCodeValues[number];

    export function isGetWsTicketGameError(err: unknown): err is DetailedError<GetWsTicketErrorCodes> {
        return err instanceof DetailedError && getWsTicketErrorCodeValues.includes(err.errorCode);
    }

}


export const GameSessionClient = {

    /**
     * List the games of the currently logged-in user
     */
    list(): Promise<Game[]> {

        interface GameResponse {
            id: string,
            name: string,
            creationTimestamp: number,
            currentTurn: number
        }

        type Response =
            | { status: 200; body: GameResponse[] }
            | { status: HttpErrorCodes, body: HttpErrorResponseBody<GameSessionClientTypes.ListGamesErrorCodes> }

        return App.httpClient
            .get<void, Response>("/api/session/list", {
                auth: authHandlerUserAuthToken,
                body: undefined,
            })
            .then(response => {
                if (response.status === 200) return response.body.map(it => ({
                    id: it.id as Game.Id,
                    name: it.name,
                    creationTimestamp: it.creationTimestamp,
                    currentTurn: it.currentTurn,
                }));
                throw new DetailedError<GameSessionClientTypes.ListGamesErrorCodes>(response.body);
            });
    },

    /**
     * Create a new game with the given name and settings
     */
    create(name: string, seed: string | null): Promise<string> {

        type Response =
            | { status: 200; body: string }
            | { status: HttpErrorCodes, body: HttpErrorResponseBody<GameSessionClientTypes.CreateGameErrorCodes> }

        return App.httpClient
            .post<void, Response>("/api/session/create?name=" + name + (seed ? ("&seed=" + seed) : ""), {
                auth: authHandlerUserAuthToken,
                body: undefined,
            })
            .then(response => {
                if (response.status === 200) return response.body;
                throw new DetailedError<GameSessionClientTypes.CreateGameErrorCodes>(response.body);
            });
    },

    /**
     * Delete a game with the given id
     */
    delete(game: Game.Id): Promise<void> {

        type Response =
            | { status: 200; body: void }
            | { status: HttpErrorCodes, body: HttpErrorResponseBody<GameSessionClientTypes.DeleteGameErrorCodes> }

        return App.httpClient
            .delete<void, Response>(`/api/session/delete/${game}`, {
                auth: authHandlerUserAuthToken,
                body: undefined,
            })
            .then(response => {
                if (response.status === 200) return undefined;
                throw new DetailedError<GameSessionClientTypes.DeleteGameErrorCodes>(response.body);
            });
    },

    /**
     * Join a game with the given id as a new player
     */
    join(game: Game.Id): Promise<void> {

        type Response =
            | { status: 200; body: void }
            | { status: HttpErrorCodes, body: HttpErrorResponseBody<GameSessionClientTypes.JoinGameErrorCodes> }

        return App.httpClient
            .post<void, Response>(`/api/session/join/${game}`, {
                auth: authHandlerUserAuthToken,
                body: undefined,
            })
            .then(response => {
                if (response.status === 200) return undefined;
                throw new DetailedError<GameSessionClientTypes.JoinGameErrorCodes>(response.body);
            });
    },

    /**
     * Get a ticket for authenticating a single websocket connection.
     */
    getWebsocketTicket(): Promise<string> {

        type Response =
            | { status: 200; body: { ticket: string } }
            | { status: HttpErrorCodes, body: HttpErrorResponseBody<GameSessionClientTypes.GetWsTicketErrorCodes> }

        return App.httpClient
            .get<void, Response>("/api/session/wsticket", {
                auth: authHandlerUserAuthToken,
                body: undefined,
            })
            .then(response => {
                if (response.status === 200) return response.body.ticket;
                throw new DetailedError<GameSessionClientTypes.GetWsTicketErrorCodes>(response.body);
            });
    },

};