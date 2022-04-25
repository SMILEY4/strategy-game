import "./gameUI.css";
import {GlobalState} from "../../../state/globalState";
import {Game} from "../../../core/game";

export function GameUI() {

	const turnState = GlobalState.useState(state => state.turnState)

	return (
		<div className="game-ui">
			<button onClick={submitTurn} disabled={turnState === "submitted"}>Submit Turn</button>
		</div>
	);

	function submitTurn() {
		Game.turn.submit();
	}

}