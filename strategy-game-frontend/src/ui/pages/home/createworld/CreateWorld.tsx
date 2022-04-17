import {ReactElement, useState} from "react";
import "./createWorld.css";
import WorldMeta = Client.WorldMeta;
import {Client} from "../../../../client/client";

export function CreateWorld(): ReactElement {

	const [worldId, setWorldId] = useState("");

	return (
		<div className="create-world">
			<b>Create new World</b>
			<button onClick={onCreateWorld}>Create</button>
			<div>{worldId}</div>
		</div>
	);

	function onCreateWorld() {
		Client.createWorld()
			.then((meta: WorldMeta) => meta.worldId)
			.then(setWorldId);
	}

}