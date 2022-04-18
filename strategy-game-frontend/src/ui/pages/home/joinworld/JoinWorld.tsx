import {ReactElement, useState} from "react";
import "./joinWorld.css";
import {CLIENT} from "../../../../client/client";
import {useNavigate} from "react-router-dom";
import {GameState} from "../../../../state/gameState";

export function JoinWorld(): ReactElement {

	const [playerId, setPlayerId] = useState("");
	const [worldId, setWorldId] = useState("");
	const [error, setError] = useState("");
	const setGameLoading = GameState.useState(state => state.setLoading);
	const navigate = useNavigate();


	return (
		<div className="join-world">
			<b>Join World</b>
			<div>
				<div>Player Name:</div>
				<input type="text" value={playerId} onChange={onChangePlayerId}/>
			</div>
			<div>
				<div>World-Id:</div>
				<input type="text" value={worldId} onChange={onChangeWorldId}/>
			</div>
			<button onClick={onJoin}>Join</button>
			{error && (<div className={"error"}>{error}</div>)}
		</div>
	);


	function onChangePlayerId(e: any) {
		setPlayerId(e.target.value);
		setError("");
	}


	function onChangeWorldId(e: any) {
		setWorldId(e.target.value);
		setError("");
	}


	function onJoin() {
		if (worldId && playerId) {
			CLIENT.openWorldMessageConnection()
				.then(() => setGameLoading(worldId))
				.then(() => CLIENT.joinWorld(worldId))
				.then(() => navigate("/game"))
				.catch(e => setError(e.toString()));
		} else {
			setError("Player Name and World-Id can not be empty!");
		}
	}

}