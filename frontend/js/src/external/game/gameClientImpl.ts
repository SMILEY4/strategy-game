import {HttpClient} from "../../common/httpClient";
import {MovementTarget} from "../../models/misc/movementTarget";
import {TileId} from "../../models/tile/tileId";
import {UserStateAccess} from "../../state/userStateAccess";
import {GameStateAccess} from "../../state/gameStateAccess";
import {GameClient} from "../../logic/game/service/gameClient";

/**
 * API-Client for in-game operations
 */
export class GameClientImpl implements GameClient {

	private readonly gameStateAccess: GameStateAccess;
	private readonly userStateAccess: UserStateAccess;
	private readonly httpClient: HttpClient;

	constructor(httpClient: HttpClient, userStateAccess: UserStateAccess, gameStateAccess: GameStateAccess) {
		this.httpClient = httpClient;
		this.userStateAccess = userStateAccess;
		this.gameStateAccess = gameStateAccess;
	}

	public getAvailableMovementPositions(worldObjectId: string, tileId: TileId, points: number): Promise<MovementTarget[]> {
		return this.httpClient.get<MovementTargetResponse[]>({
			url: "/api/game/movement/availablepositions?gameId=" + this.gameStateAccess.getGameIdOrThrow() + "&worldObjectId=" + worldObjectId + "&pos=" + tileId + "&points=" + points,
			requireAuth: true,
			token: this.userStateAccess.getAuthTokenOrNull(),
		}).then(targets => targets.map(tgt => ({
			tile: {
				id: tgt.tile.id,
				position: {
					q: tgt.tile.position.q,
					r: tgt.tile.position.r,
				},
			},
			cost: tgt.cost,
		})));
	}

}
