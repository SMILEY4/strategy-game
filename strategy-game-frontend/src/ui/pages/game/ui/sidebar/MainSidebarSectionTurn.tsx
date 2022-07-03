import {ReactElement} from "react";
import {Hooks} from "../../../../../core/hooks";
import {AppConfig} from "../../../../../main";

export function MainSidebarSectionTurn(): ReactElement {

    const turnState = Hooks.useTurnState();

    return (
        <div className="content-area turn-area">
            <button onClick={submitTurn} disabled={turnState === "submitted"}>Submit Turn</button>
            <button onClick={debugLooseContext}>Loose WebGL context</button>
            <button onClick={debugRestoreContext}>Restore WebGL context</button>
        </div>
    );

    function submitTurn() {
        AppConfig.turnSubmit.perform();
    }

    function debugLooseContext() {
        AppConfig.debugLooseWebglContext();
    }

    function debugRestoreContext() {
        AppConfig.debugRestoreWebglContext();
    }

}