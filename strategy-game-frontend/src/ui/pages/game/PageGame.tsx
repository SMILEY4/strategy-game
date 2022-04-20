import {ReactElement, useEffect} from "react";
import "./pageGame.css";
import {GlobalState} from "../../../state/globalState";
import {useNavigate} from "react-router-dom";
import {Canvas} from "./Canvas";
import {GameUI} from "./GameUI";

export function PageGame(): ReactElement {

	const currentState = GlobalState.useState(state => state.currentState);
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
				<div className="game-container">
					<Canvas/>
					<GameUI/>
				</div>

			)}
		</div>
	);
}