import {ReactElement} from "react";
import {LocalGameStateHooks} from "../../../../external/state/localgame/localGameStateHooks";
import {AppConfig} from "../../../../main";
import {GameState} from "../../../../models/state/gameState";

export function NextTurnAction(): ReactElement {
    const actionSubmit = AppConfig.di.get(AppConfig.DIQ.TurnSubmitAction)
    const gameState = LocalGameStateHooks.useCurrentGameState();
    return (
        <div
            onClick={submitTurn}
            style={(gameState === GameState.SUBMITTED) ? {color: "#575757"} : undefined}
        >
            {"Next Turn >"}
        </div>
    );

    function submitTurn() {
        actionSubmit.perform();
    }
}