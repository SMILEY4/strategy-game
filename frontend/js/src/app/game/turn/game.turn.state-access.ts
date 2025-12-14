import {GameSession} from "../../../models/misc/gameSession";
import {usePartialSingletonEntity} from "../../../common/db/adapters/databaseHooks";
import {App} from "../../../appContext";

export const TurnStateAccess = {

    useTurnState(): GameSession.TurnState {
        return usePartialSingletonEntity(App.gameSessionDatabase, e => e.turnState);
    },

    useCurrentTurn(): number {
        return usePartialSingletonEntity(App.gameSessionDatabase, e => e.turn);
    },

    getCurrentTurn(): number {
        return App.gameSessionDatabase.get().turn;
    }
}