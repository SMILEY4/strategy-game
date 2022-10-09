import {ReactElement, useState} from "react";
import {AppConfig} from "../../../../main";
import "./createWorld.css";

export function CreateWorld(): ReactElement {

    const actionCreateGame = AppConfig.di.get(AppConfig.DIQ.GameCreateAction);
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
        actionCreateGame.perform()
            .then(gameId => setWorldId(gameId))
            .catch(e => setError(e.toString()));
    }

}