import {ReactElement, useState} from "react";
import "./createWorld.css";
import {Client} from "../../client/client";
import WorldMeta = Client.WorldMeta;

export function CreateWorld(): ReactElement {

	const [worldId, setWorldId] = useState("");

	return (
		<div className="create-world">
			<button onClick={onCreateWorld}>
				Create new World
			</button>
			<div>{worldId}</div>
		</div>
	);

	function onCreateWorld() {
		Client.createWorld()
			.then((meta: WorldMeta) => meta.worldId)
			.then(setWorldId);
	}

}