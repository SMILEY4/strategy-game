import {ReactElement, useState} from "react";
import {AppConfig} from "../../../../main";
import "./createWorld.css";

export function CreateWorld(): ReactElement {

    const actionCreateGame = AppConfig.di.get(AppConfig.DIQ.GameCreateAction);
    const [seed, setSeed] = useState("");
    const [worldId, setWorldId] = useState("");
    const [error, setError] = useState("");

    return (
        <div className="create-world">
            <b>Create new World</b>

            <div>
                <div>Seed (url-safe, optional):</div>
                <input type="text" value={seed} onChange={onChangeSeed}/>
            </div>

            <button onClick={onCreateWorld}>Create</button>

            <div>{worldId}</div>
            {error && (<div className={"error"}>{error}</div>)}
        </div>
    );

    function onChangeSeed(e: any) {
        setSeed(e.target.value);
    }

    function onCreateWorld() {
        actionCreateGame.perform(getCleanSeed())
            .then(gameId => setWorldId(gameId))
            .catch(e => setError(e.toString()));
    }

    function getCleanSeed() {
        let cleanSeed = seed.trim()
        if (cleanSeed.length === 0) {
            return null
        } else {
            return cleanSeed
        }
    }

}