import {GameLobbyConnectAction} from "../../../ports/provided/gamelobby/gameLobbyConnectAction";
import {GameMessagingApi} from "../../../ports/required/api/gameMessagingApi";
import {GameStateAccess} from "../../../ports/required/state/gameStateAccess";

export class GameLobbyConnectActionImpl implements GameLobbyConnectAction {

    private readonly gameMsgApi: GameMessagingApi;
    private readonly gameStateAccess: GameStateAccess;

    constructor(gameMsgApi: GameMessagingApi, gameStateAccess: GameStateAccess) {
        this.gameMsgApi = gameMsgApi;
        this.gameStateAccess = gameStateAccess;
    }

    perform(gameId: string): Promise<void> {
        return this.gameMsgApi.open(gameId).then(() => {
            this.gameStateAccess.setLoading(gameId);
        });
    }

}