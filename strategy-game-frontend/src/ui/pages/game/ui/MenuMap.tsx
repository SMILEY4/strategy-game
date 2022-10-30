import {ReactElement} from "react";
import {FiMap} from "react-icons/fi";
import {useMapMode} from "../../../../core/hooks/useMapMode";
import {AppConfig} from "../../../../main";
import {MapMode} from "../../../../core/models/mapMode";

export function CategoryMap(): ReactElement {
    const uiService = AppConfig.di.get(AppConfig.DIQ.UIService);
    return (
        <div onClick={() => uiService.openToolbarMenuMap()}>
            <FiMap/>
        </div>
    );
}


export function MenuMap(): ReactElement {

    const [mode, setMode] = useMapMode();

    return (
        <div>
            <h3>Map-Modes</h3>
            <button onClick={() => setMode(MapMode.DEFAULT)} disabled={mode === MapMode.DEFAULT}>Default</button>
            <button onClick={() => setMode(MapMode.COUNTRIES)} disabled={mode === MapMode.COUNTRIES}>Countries</button>
            <button onClick={() => setMode(MapMode.CITIES)} disabled={mode === MapMode.CITIES}>Cities</button>
            <button onClick={() => setMode(MapMode.TERRAIN)} disabled={mode === MapMode.TERRAIN}>Terrain</button>
            <button onClick={() => setMode(MapMode.RESOURCES)} disabled={mode === MapMode.RESOURCES}>Resources</button>
        </div>
    );

}