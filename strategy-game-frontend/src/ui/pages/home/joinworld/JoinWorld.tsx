import {ReactElement, useState} from "react";
import "./joinWorld.css";
import {Client} from "../../../../client/client";
import {useNavigate} from "react-router-dom";

export function JoinWorld(): ReactElement {

	const [playerId, setPlayerId] = useState("");
	const [worldId, setWorldId] = useState("");
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
		</div>
	);


	function onChangePlayerId(e: any) {
		setPlayerId(e.target.value);
	}


	function onChangeWorldId(e: any) {
		setWorldId(e.target.value);
	}


	function onJoin() {
		Client.joinWorld(worldId, playerId)
			.then(() => navigate("/game"));
	}

}