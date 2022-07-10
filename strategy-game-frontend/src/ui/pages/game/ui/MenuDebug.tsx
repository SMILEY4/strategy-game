import {ReactElement} from "react";
import {CgDebug} from "react-icons/cg";
import {UiStore} from "../../../../external/state/ui/uiStore";
import {AppConfig} from "../../../../main";

export function CategoryDebug(): ReactElement {

    const open = UiStore.useOpenDialog();

    function onAction() {
        open("topbar.category.menu", 10, 50, 320, 650, (
            <MenuDebug/>
        ));
    }

    return (
        <div onClick={onAction}>
            <CgDebug/>
        </div>
    );
}


export function MenuDebug(): ReactElement {

    const setDialogPositions = UiStore.useState().setAllPositions;

    return (
        <div>
            <h3>Debug-Menu</h3>
            <button onClick={centerDialogs}>Center Dialogs</button>
            <button onClick={debugLooseContext}>Loose WebGL context</button>
            <button onClick={debugRestoreContext}>Restore WebGL context</button>
        </div>
    );

    function centerDialogs() {
        const x = 300;
        const y = 300;
        setDialogPositions(x, y);
    }

    function debugLooseContext() {
        AppConfig.debugLooseWebglContext();
    }

    function debugRestoreContext() {
        AppConfig.debugRestoreWebglContext();
    }

}