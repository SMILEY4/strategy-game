import "./gameUI.css";
import {DISTRIBUTOR} from "../../../main";
import {GlobalState} from "../../../state/globalState";

export function GameUI() {

	const turnState = GlobalState.useState(state => state.turnState)

	return (
		<div className="game-ui">
			<button onClick={submitTurn} disabled={turnState === "submitted"}>Submit Turn</button>
		</div>
	);

	function submitTurn() {
		DISTRIBUTOR.submitTurn();
	}

}