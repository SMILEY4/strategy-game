import {GameSession} from "../../models/misc/gameSession";
import {usePartialSingletonEntity} from "../../common/db/adapters/databaseHooks";
import {Db} from "../database";

export function useGameSessionState(): GameSession.SessionState {
    return usePartialSingletonEntity(Db.gameSession, e => e.sessionState);
}