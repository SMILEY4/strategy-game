import {GameSession} from "../../../models/misc/gameSession";
import {usePartialSingletonEntity} from "../../../common/db/adapters/databaseHooks";
import {App} from "../../../appContext";
import {Db} from "../../database";

export const TurnStateAccess = {

    useTurnState(): GameSession.TurnState {
        return usePartialSingletonEntity(Db.gameSession, e => e.turnState);
    },

    useCurrentTurn(): number {
        return usePartialSingletonEntity(Db.gameSession, e => e.turn);
    },

    getCurrentTurn(): number {
        return Db.gameSession.get().turn;
    }
}