import {HttpErrorCodes} from "../http/http.status-codes";
import {DetailedError, HttpErrorResponseBody} from "../../common/detailedError";
import {App} from "../../appContext";
import {authHandlerUserAuthToken} from "../authentication/auth.handler.user-auth-token";
import {WorldObject} from "../../models/worldobject/worldObject";
import {Tile} from "../../models/tile/tile";
import {MovementTarget} from "../../models/misc/movementTarget";
import {getGameIdFromUrl} from "./game.id-from-url";

export namespace GameClientTypes {

    //==== RANDOM SETTLEMENT NAME ==================

    const getRandomSettlementNameErrorCodeValues = ["todo"] as const;

    export type GetRandomSettlementNameErrorCodes = typeof getRandomSettlementNameErrorCodeValues[number];

    export function isGetRandomSettlementNameError(err: unknown): err is DetailedError<GetRandomSettlementNameErrorCodes> {
        return err instanceof DetailedError && getRandomSettlementNameErrorCodeValues.includes(err.errorCode);
    }

    //==== MOVEMENT POSITIONS ======================

    const getAvailableMovementPositionsErrorCodeValues = ["todo"] as const;

    export type GetAvailableMovementPositionsErrorCodes = typeof getAvailableMovementPositionsErrorCodeValues[number];

    export function isGetAvailableMovementPositionsError(err: unknown): err is DetailedError<GetAvailableMovementPositionsErrorCodes> {
        return err instanceof DetailedError && getAvailableMovementPositionsErrorCodeValues.includes(err.errorCode);
    }


}

export const GameClient = {

    /**
     * Provides a randomly generated name for a settlement.
     */
    getRandomSettlementName(): Promise<string> {

        type Response =
            | { status: 200; body: { name: string } }
            | { status: HttpErrorCodes, body: HttpErrorResponseBody<GameClientTypes.GetRandomSettlementNameErrorCodes> }

        return App.httpClient
            .get<void, Response>("/api/game/settlement/randomname", {
                auth: authHandlerUserAuthToken,
                body: undefined,
            })
            .then(response => {
                if (response.status === 200) return response.body.name;
                throw new DetailedError<GameClientTypes.GetRandomSettlementNameErrorCodes>(response.body);
            });
    },

    getAvailableMovementPositions(worldObject: WorldObject.Id, tile: Tile.Id, points: number): Promise<MovementTarget[]> {

        interface MovementTargetResponse {
            tile: {
                id: string,
                position: {
                    q: number,
                    r: number
                }
            },
            cost: number
        }

        type Response =
            | { status: 200; body: MovementTargetResponse[] }
            | {
            status: HttpErrorCodes, body: HttpErrorResponseBody<GameClientTypes.GetAvailableMovementPositionsErrorCodes>
        }

        return App.httpClient
            .get<void, Response>(`/api/game/movement/availablepositions?gameId=${getGameIdFromUrl()}&worldObjectId=${worldObject}&pos=${tile}&points=${points}`, {
                auth: authHandlerUserAuthToken,
                body: undefined,
            })
            .then(response => {
                if (response.status === 200) return response.body.map(tgt => ({
                    tile: {
                        id: tgt.tile.id as Tile.Id,
                        position: {
                            q: tgt.tile.position.q,
                            r: tgt.tile.position.r,
                        },
                    },
                    cost: tgt.cost,
                }));
                throw new DetailedError<GameClientTypes.GetAvailableMovementPositionsErrorCodes>(response.body);
            });
    },

};