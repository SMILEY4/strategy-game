import {AuthProvider} from "../user/authProvider";
import {HttpClient} from "../shared/httpClient";
import {TilePosition} from "../models/tilePosition";
import {TileIdentifier} from "../models/tile";
import {GameIdProvider} from "../gamesession/gameIdProvider";

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
	public getAvailableMovementPositions(worldObjectId: string, pos: TileIdentifier): Promise<TilePosition[]> {
		return this.httpClient.get<TilePosition[]>({
			url: "/api/game/movement/availablepositions?gameId=" + this.gameIdProvider.getGameIdOrThrow() + "&worldObjectId=" + worldObjectId + "&pos=" + pos.id,
			requireAuth: true,
			token: this.authProvider.getToken(),
		});
	}

}