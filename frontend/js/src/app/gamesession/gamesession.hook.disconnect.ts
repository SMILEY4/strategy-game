import {App} from "../../appContext";
import {GameSession} from "../../models/misc/gameSession";
import {GameSessionConnectionClient} from "./gamesession.client.connection";

export function useGameSessionDisconnect(): () => void {
    return () => {
        return Promise.resolve()
            .then(() => App.gameStateWriter.setGameSessionState(GameSession.SessionState.None))
            .then(() => GameSessionConnectionClient.close())
            .catch(e => console.error(e));
    };
}