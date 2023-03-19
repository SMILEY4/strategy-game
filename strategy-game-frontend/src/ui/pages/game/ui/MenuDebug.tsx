import {ReactElement} from "react";
import {CgDebug} from "react-icons/cg";
import {MapMode} from "../../../../core/models/mapMode";
import {AppConfig} from "../../../../main";
import {AdvButton} from "../../../components/specific/AdvButton";
import {Section} from "../../../components/specific/Section";

export function CategoryDebug(): ReactElement {
    const uiService = AppConfig.di.get(AppConfig.DIQ.UIService)
    return (
        <div onClick={() => uiService.openToolbarMenuDebug()}>
            <CgDebug/>
        </div>
    );
}


export function MenuDebug(): ReactElement {
    const uiService = AppConfig.di.get(AppConfig.DIQ.UIService)

    function debugLooseContext() {
        AppConfig.debugLooseWebglContext();
    }

    function debugRestoreContext() {
        AppConfig.debugRestoreWebglContext();
    }

    return (
        <Section title={"Debug Actions"}>
            <AdvButton
                label={"Center Dialogs"}
                actionCosts={[]}
                turnCosts={[]}
                disabled={false}
                onClick={uiService.repositionAll}
            />
            <AdvButton
                label={"Loose WebGL-Context"}
                actionCosts={[]}
                turnCosts={[]}
                disabled={false}
                onClick={debugLooseContext}
            />
            <AdvButton
                label={"Restore WebGL-Context"}
                actionCosts={[]}
                turnCosts={[]}
                disabled={false}
                onClick={debugRestoreContext}
            />
        </Section>
    );

}