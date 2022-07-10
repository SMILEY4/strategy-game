import {ReactElement} from "react";
import {CgDebug} from "react-icons/cg";
import {Hooks} from "../../../../core/hooks";
import {AppConfig} from "../../../../main";

export function CategoryDebug(): ReactElement {
    const open = Hooks.useOpenPrimaryMenuDialog(<MenuDebug/>);
    return (
        <div onClick={open}>
            <CgDebug/>
        </div>
    );
}


export function MenuDebug(): ReactElement {

    const repositionDialogs = Hooks.useRepositionDialogs();

    function debugLooseContext() {
        AppConfig.debugLooseWebglContext();
    }

    function debugRestoreContext() {
        AppConfig.debugRestoreWebglContext();
    }

    return (
        <div>
            <h3>Debug-Menu</h3>
            <button onClick={repositionDialogs}>Center Dialogs</button>
            <button onClick={debugLooseContext}>Loose WebGL context</button>
            <button onClick={debugRestoreContext}>Restore WebGL context</button>
        </div>
    );

}