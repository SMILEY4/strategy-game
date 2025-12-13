import {usePartialSingletonEntity} from "../../../common/db/adapters/databaseHooks";
import {App} from "../../../appContext";

export function useCurrentTurn(): number {
    return usePartialSingletonEntity(App.gameSessionDatabase, e => e.turn);
}