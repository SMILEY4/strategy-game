import {HttpClient} from "../../common/httpClient";
import {MovementTarget} from "../../models/misc/movementTarget";
import {GameStateAccess} from "../../state/gameStateAccess";
import {GameClient} from "../../logic/game/service/gameClient";
import {Tile} from "../../models/tile/tile";
import {WorldObject} from "../../models/worldobject/worldObject";
import {authService} from "../../app/authentication/auth.service";

/**
 * API-Client for in-game operations
 */
export class GameClientImpl implements GameClient {

    private readonly gameStateAccess: GameStateAccess;
    private readonly httpClient: HttpClient;

    constructor(httpClient: HttpClient, gameStateAccess: GameStateAccess) {
        this.httpClient = httpClient;
        this.gameStateAccess = gameStateAccess;
    }

    getRandomSettlementName(): Promise<string> {
        return this.httpClient.get<{ name: string }>({
            url: "/api/game/settlement/randomname",
            requireAuth: true,
            token: authService.getAuthToken(),
        }).then(it => it.name);
    }

    getAvailableMovementPositions(worldObject: WorldObject.Id, tile: Tile.Id, points: number): Promise<MovementTarget[]> {
        return this.httpClient.get<MovementTargetResponse[]>({
            url: "/api/game/movement/availablepositions?gameId=" + this.gameStateAccess.getGameIdOrThrow() + "&worldObjectId=" + worldObject + "&pos=" + tile + "&points=" + points,
            requireAuth: true,
            token: authService.getAuthToken(),
        }).then(targets => targets.map(tgt => ({
            tile: {
                id: tgt.tile.id as Tile.Id,
                position: {
                    q: tgt.tile.position.q,
                    r: tgt.tile.position.r,
                },
            },
            cost: tgt.cost,
        })));
    }

}
