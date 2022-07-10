import {ReactElement} from "react";
import {GrStatusUnknown} from "react-icons/gr";
import {UiStore} from "../../../../external/state/ui/uiStore";

export function CategoryOther(): ReactElement {

    const open = UiStore.useOpenDialog();

    function onAction() {
        open("topbar.category.menu", 10, 50, 320, 650, (
            <MenuOther/>
        ));
    }

    return (
        <div onClick={onAction}>
            <GrStatusUnknown/>
        </div>
    );
}


export function MenuOther(): ReactElement {

    return (
        <div>
            <h3>Misc-Menu</h3>
        </div>
    );

}