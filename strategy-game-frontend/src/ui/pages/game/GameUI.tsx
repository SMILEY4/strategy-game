import {Game} from "../../../core/game";
import {Hooks} from "../../../core/hooks";
import {AppConfig} from "../../../main";
import "./gameUI.css";

export function GameUI() {

    const turnState = Hooks.useTurnState();

    return (
        <div className="game-ui">
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