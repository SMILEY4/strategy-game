import {ReactElement, useState} from "react";
import "./createWorld.css";
import {Game} from "../../../../core/game";

export function CreateWorld(): ReactElement {

	const [worldId, setWorldId] = useState("");
	const [error, setError] = useState("");

	return (
		<div className="create-world">
			<b>Create new World</b>
			<button onClick={onCreateWorld}>Create</button>
			<div>{worldId}</div>
			{error && (<div className={"error"}>{error}</div>)}
		</div>
	);

	function onCreateWorld() {
		Game.world.create()
			.then(wid => setWorldId(wid))
			.catch(e => setError(e.toString()));
	}

}