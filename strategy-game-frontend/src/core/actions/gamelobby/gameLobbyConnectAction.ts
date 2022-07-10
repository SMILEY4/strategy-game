import {GameMessagingApi} from "../../../external/api/gameMessagingApi";
import {GameStateAccess} from "../../../external/state/game/gameStateAccess";

export class GameLobbyConnectAction {

    private readonly gameMsgApi: GameMessagingApi;
    private readonly gameStateAccess: GameStateAccess;

    constructor(gameMsgApi: GameMessagingApi, gameStateAccess: GameStateAccess) {
        this.gameMsgApi = gameMsgApi;
        this.gameStateAccess = gameStateAccess;
    }

    perform(gameId: string): Promise<void> {
        console.debug("Connecting to game-lobby")
        return this.gameMsgApi.open(gameId).then(() => {
            this.gameStateAccess.setLoading(gameId);
        });
    }

}