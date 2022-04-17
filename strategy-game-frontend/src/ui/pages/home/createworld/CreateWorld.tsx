import {ReactElement, useState} from "react";
import "./createWorld.css";
import {Client} from "../../../../client/client";
import WorldMeta = Client.WorldMeta;

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
		Client.createWorld()
			.then((meta: WorldMeta) => meta.worldId)
			.then(setWorldId)
			.catch(e => setError(e.toString()));
	}

}