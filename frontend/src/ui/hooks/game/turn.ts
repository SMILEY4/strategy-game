import {AppCtx} from "../../../logic/appContext";
import {GameSessionStateAccess} from "../../../state/access/GameSessionStateAccess";

export function useEndTurn(): [boolean, () => void] {

    const gameService = AppCtx.di.get(AppCtx.DIQ.GameService);
    const disabled = GameSessionStateAccess.useTurnState() === "waiting";
    const setTurnState = GameSessionStateAccess.useSetTurnState();

    function endTurn() {
        gameService.endTurn();
        setTurnState("waiting");
    }

    return [disabled, endTurn];
}