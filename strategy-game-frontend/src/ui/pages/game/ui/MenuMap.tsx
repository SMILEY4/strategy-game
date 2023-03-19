import {ReactElement} from "react";
import {FiMap} from "react-icons/fi";
import {useMapMode} from "../../../../core/hooks/useMapMode";
import {MapMode} from "../../../../core/models/mapMode";
import {AppConfig} from "../../../../main";
import {AdvButton} from "../../../components/specific/AdvButton";
import {Section} from "../../../components/specific/Section";

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
        <Section title={"Map Modes"}>
            <AdvButton
                label={"Default"}
                actionCosts={[]}
                turnCosts={[]}
                disabled={mode === MapMode.DEFAULT}
                onClick={() => setMode(MapMode.DEFAULT)}
            />
            <AdvButton
                label={"Countries"}
                actionCosts={[]}
                turnCosts={[]}
                disabled={mode === MapMode.COUNTRIES}
                onClick={() => setMode(MapMode.COUNTRIES)}
            />
            <AdvButton
                label={"Cities"}
                actionCosts={[]}
                turnCosts={[]}
                disabled={mode === MapMode.CITIES}
                onClick={() => setMode(MapMode.CITIES)}
            />
            <AdvButton
                label={"Terrain"}
                actionCosts={[]}
                turnCosts={[]}
                disabled={mode === MapMode.TERRAIN}
                onClick={() => setMode(MapMode.TERRAIN)}
            />
            <AdvButton
                label={"Resources"}
                actionCosts={[]}
                turnCosts={[]}
                disabled={mode === MapMode.RESOURCES}
                onClick={() => setMode(MapMode.RESOURCES)}
            />
        </Section>
    );

}