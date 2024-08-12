import {AuthProvider} from "../user/authProvider";
import {HttpClient} from "../shared/httpClient";
import {TileIdentifier} from "../models/tile";
import {GameIdProvider} from "../gamesession/gameIdProvider";
import {MovementTarget} from "../models/movementTarget";

/**
 * API-Client for ingame-operations
 */
export class GameClient {

	private readonly authProvider: AuthProvider;
    private readonly gameIdProvider: GameIdProvider;
	private readonly httpClient: HttpClient;

    constructor(authProvider: AuthProvider, gameIdProvider: GameIdProvider, httpClient: HttpClient) {
        this.authProvider = authProvider;
        this.gameIdProvider = gameIdProvider;
        this.httpClient = httpClient;
    }

    /**
	 * Get all available positions to move to for the given world object id from the given location
	 */
	public getAvailableMovementPositions(worldObjectId: string, pos: TileIdentifier, points: number): Promise<MovementTarget[]> {
		return this.httpClient.get<MovementTarget[]>({
			url: "/api/game/movement/availablepositions?gameId=" + this.gameIdProvider.getGameIdOrThrow() + "&worldObjectId=" + worldObjectId + "&pos=" + pos.id + "&points=" + points,
			requireAuth: true,
			token: this.authProvider.getToken(),
		});
	}

	/**
	 * Get a random name for a settlement
	 */
	public getRandomSettlementName(): Promise<{name: string}> {
		return this.httpClient.get<{name: string}>({
			url: "/api/game/settlement/randomname",
			requireAuth: true,
			token: this.authProvider.getToken(),
		});
	}

}