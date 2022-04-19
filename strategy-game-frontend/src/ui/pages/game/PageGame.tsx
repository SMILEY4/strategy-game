import {ReactElement, useEffect} from "react";
import "./pageGame.css";
import {GlobalState} from "../../../state/globalState";
import {useNavigate} from "react-router-dom";
import Canvas from "./Canvas";
import {DISTRIBUTOR} from "../../../main";

export function PageGame(): ReactElement {

	const currentState = GlobalState.useState(state => state.currentState);
	const navigate = useNavigate();

	useEffect(() => {
		if (currentState === "idle") {
			// TODO temp4testing
			DISTRIBUTOR.requestJoinWorld("3d560851-1ba0-45f1-9f19-de31168fdc2f", navigate)
			// navigate("/home");
		}
	});

	return (
		<div className="game">
			{(currentState === "loading") && (
				<div>Loading...</div>
			)}
			{(currentState === "active") && (
				<Canvas/>
			)}
		</div>
	);
}