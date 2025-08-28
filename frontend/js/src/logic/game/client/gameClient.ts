import {HttpClient} from "../../../common/httpClient";
import {MovementTarget} from "../../../models/misc/movementTarget";
import {TileId} from "../../../models/tile/tileId";
import {UserStateAccess} from "../../../state/userStateAccess";
import {GameStateAccess} from "../../../state/gameStateAccess";

/**
 * API-Client for in-game operations
 */
export class GameClient {

	private readonly gameStateAccess: GameStateAccess;
	private readonly userStateAccess: UserStateAccess;
	private readonly httpClient: HttpClient;

	constructor(httpClient: HttpClient, userStateAccess: UserStateAccess, gameStateAccess: GameStateAccess) {
		this.httpClient = httpClient;
		this.userStateAccess = userStateAccess;
		this.gameStateAccess = gameStateAccess;
	}

	/**
	 * Get all available positions to move to for the given world object id from the given location
	 */
	public getAvailableMovementPositions(worldObjectId: string, tileId: TileId, points: number): Promise<MovementTarget[]> {
		return this.httpClient.get<MovementTargetResponse[]>({
			url: "/api/game/movement/availablepositions?gameId=" + this.gameStateAccess.getGameIdOrThrow() + "&worldObjectId=" + worldObjectId + "&pos=" + tileId + "&points=" + points,
			requireAuth: true,
			token: this.userStateAccess.getAuthTokenOrNull(),
		}).then(targets => targets.map(tgt => ({
			tile: {
				id: tgt.tile.id,
				position: {
					q: tgt.tile.q,
					r: tgt.tile.r,
				},
			},
			cost: tgt.cost,
		})));
	}

	/**
	 * Get a random name for a settlement
	 */
	public getRandomSettlementName(): Promise<string> {
		return this.httpClient.get<SettlementNameResponse>({
			url: "/api/game/settlement/randomname",
			requireAuth: true,
			token: this.userStateAccess.getAuthTokenOrNull(),
		}).then(it => it.name);
	}

}

interface MovementTargetResponse {
	tile: {
		id: string,
		q: number,
		r: number
	},
	cost: number
}

interface SettlementNameResponse {
	name: string
}

