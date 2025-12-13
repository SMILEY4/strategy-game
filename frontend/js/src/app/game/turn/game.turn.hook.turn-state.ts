import {GameSession} from "../../../models/misc/gameSession";
import {usePartialSingletonEntity} from "../../../common/db/adapters/databaseHooks";
import {App} from "../../../appContext";

export function useTurnState(): GameSession.TurnState {
    return usePartialSingletonEntity(App.gameSessionDatabase, e => e.turnState);
}