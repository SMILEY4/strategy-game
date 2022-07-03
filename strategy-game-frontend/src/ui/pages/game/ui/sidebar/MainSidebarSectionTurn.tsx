import {ReactElement} from "react";
import {Hooks} from "../../../../../core/hooks";
import {UiStore} from "../../../../../external/state/ui/uiStore";
import {AppConfig} from "../../../../../main";

export function MainSidebarSectionTurn(): ReactElement {

    const turnState = Hooks.useTurnState();
    const setDialogPositions = UiStore.useState().setAllPositions;

    return (
        <div className="content-area turn-area">
            <button onClick={centerDialogs}>Center Dialogs</button>
            <button onClick={submitTurn} disabled={turnState === "submitted"}>Submit Turn</button>
            <button onClick={debugLooseContext}>Loose WebGL context</button>
            <button onClick={debugRestoreContext}>Restore WebGL context</button>
        </div>
    );


    function centerDialogs() {
        const x = 300;
        const y = 300;
        setDialogPositions(x, y)
    }

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