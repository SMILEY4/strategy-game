import {ReactElement, useState} from "react";
import "./joinWorld.css";
import {useNavigate} from "react-router-dom";
import {Game} from "../../../../core/game";

export function JoinWorld(): ReactElement {

	const [worldId, setWorldId] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();


	return (
		<div className="join-world">
			<b>Join World</b>
			<div>
				<div>World-Id:</div>
				<input type="text" value={worldId} onChange={onChangeWorldId}/>
			</div>
			<button onClick={onJoin}>Join</button>
			{error && (<div className={"error"}>{error}</div>)}
		</div>
	);


	function onChangeWorldId(e: any) {
		setWorldId(e.target.value);
		setError("");
	}


	function onJoin() {
		if (worldId) {
			Game.world.join(worldId)
				.then(() => navigate("/game"))
				.catch(e => setError(e.toString()));
		} else {
			setError("Player Name and World-Id can not be empty!");
		}
	}

}