import {AppCtx} from "../../../logic/appContext";
import {useState} from "react";

export function useEndTurn(): [boolean, () => void] {

    const gameService = AppCtx.di.get(AppCtx.DIQ.GameService);
    const [disabled, setDisabled] = useState(false);

    function endTurn() {
        gameService.endTurn();
        // setDisabled(true) // todo
    }

    return [disabled, endTurn];
}