import {ReactElement} from "react";
import {CgDebug} from "react-icons/cg";
import {AppConfig} from "../../../../main";

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
        <div>
            <h3>Debug-Menu</h3>
            <button onClick={uiService.repositionAll}>Center Dialogs</button>
            <button onClick={debugLooseContext}>Loose WebGL context</button>
            <button onClick={debugRestoreContext}>Restore WebGL context</button>
        </div>
    );

}