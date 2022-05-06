import "./gameUI.css";
import {GlobalState} from "../../../state/globalState";
import {Game} from "../../../core/game";

export function GameUI() {

	const turnState = GlobalState.useState(state => state.turnState)

	return (
		<div className="game-ui">
			<button onClick={submitTurn} disabled={turnState === "submitted"}>Submit Turn</button>
			<button onClick={debugLooseContext}>Loose WebGL context</button>
			<button onClick={debugRestoreContext}>Restore WebGL context</button>
		</div>
	);

	function submitTurn() {
		Game.turn.submit();
	}

	function debugLooseContext() {
		Game.debugLooseWebglContext()
	}

	function debugRestoreContext() {
		Game.debugRestoreWebglContext()
	}
}