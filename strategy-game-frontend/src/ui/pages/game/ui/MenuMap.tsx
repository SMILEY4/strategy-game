import {ReactElement} from "react";
import {FiMap} from "react-icons/fi";
import {LocalGameStateHooks} from "../../../../external/state/localgame/localGameStateHooks";
import {UiStateHooks} from "../../../../external/state/ui/uiStateHooks";
import {MapMode} from "../../../../models/state/mapMode";

export function CategoryMap(): ReactElement {
    const open = UiStateHooks.useOpenPrimaryMenuDialog(<MenuMap/>);
    return (
        <div onClick={open}>
            <FiMap/>
        </div>
    );
}


export function MenuMap(): ReactElement {

    const [mode, setMode] = LocalGameStateHooks.useMapMode();

    return (
        <div>
            <h3>Map-Modes</h3>
            <button onClick={() => setMode(MapMode.DEFAULT)} disabled={mode === MapMode.DEFAULT}>Default</button>
            <button onClick={() => setMode(MapMode.COUNTRIES)} disabled={mode === MapMode.COUNTRIES}>Countries</button>
            <button onClick={() => setMode(MapMode.PROVINCES)} disabled={mode === MapMode.PROVINCES}>Provinces</button>
            <button onClick={() => setMode(MapMode.CITIES)} disabled={mode === MapMode.CITIES}>Cities</button>
            <button onClick={() => setMode(MapMode.TERRAIN)} disabled={mode === MapMode.TERRAIN}>Terrain</button>
        </div>
    );

}