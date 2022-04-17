import {ReactElement} from "react";
import "./pageGame.css";
import {GameState} from "../../../state/gameState";

export function PageGame(): ReactElement {

	const initialized = GameState.useState(state => state.initialized);
	const map = GameState.useState(state => state.map);

	return (
		<div className="game">
			{!initialized && (
				<div>Loading...</div>
			)}
			{initialized && (
				<>
					<div>World loaded:</div>
					<div>{map.length + " Tiles"}</div>
					<pre>{JSON.stringify(map, null, "   ")}</pre>
				</>
			)}
		</div>
	);
}