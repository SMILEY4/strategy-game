import {ReactElement} from "react";
import {Hooks} from "../../../../../core/hooks";
import {AppConfig} from "../../../../../main";

export function NextTurnAction(): ReactElement {

    const turnState = Hooks.useTurnState();

    return (
        <div
            onClick={submitTurn}
            style={(turnState === "submitted") ? {color: "#575757"} : undefined}
        >
            {"Next Turn >"}
        </div>
    );

    function submitTurn() {
        AppConfig.turnSubmit.perform();
    }
}