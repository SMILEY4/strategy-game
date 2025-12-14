import {App} from "../../appContext";
import {GameSession} from "../../models/misc/gameSession";
import {GameSessionConnectionClient} from "./gamesession.client.connection";
import {Db} from "../database";

export function useGameSessionDisconnect(): () => void {
    return () => {
        return Promise.resolve()
            .then(() => clearGameSessionState())
            .then(() => GameSessionConnectionClient.close())
            .catch(e => console.error(e));
    };
}


function clearGameSessionState() {
    Db.gameSession.update(() => ({
        sessionState: GameSession.SessionState.None,
    }));
}