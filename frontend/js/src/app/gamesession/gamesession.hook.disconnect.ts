import {App} from "../../appContext";
import {GameSession} from "../../models/misc/gameSession";

export function useGameSessionDisconnect(): () => void {
    return () => {
        return Promise.resolve()
            .then(() => App.gameStateWriter.setGameSessionState(GameSession.SessionState.None))
            .then(() => App.gameSessionClient.disconnect())
            .catch(e => console.error(e));
    };
}