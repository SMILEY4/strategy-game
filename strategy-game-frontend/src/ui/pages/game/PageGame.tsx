import {ReactElement, useEffect} from "react";
import "./pageGame.css";
import {GameState} from "../../../state/gameState";
import {useNavigate} from "react-router-dom";

export function PageGame(): ReactElement {

	const currentState = GameState.useState(state => state.currentState);
	const map = GameState.useState(state => state.map);
	const navigate = useNavigate();

	useEffect(() => {
		if (currentState === "idle") {
			navigate("/home");
		}
	});

	return (
		<div className="game">
			{(currentState === "loading") && (
				<div>Loading...</div>
			)}
			{(currentState === "active") && (
				<>
					<div>World loaded:</div>
					<div>{map.length + " Tiles"}</div>
					<pre>{JSON.stringify(map, null, "   ")}</pre>
				</>
			)}
		</div>
	);
}