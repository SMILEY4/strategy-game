import {ReactElement} from "react";
import {GrStatusUnknown} from "react-icons/gr";
import {UiStateHooks} from "../../../../external/state/ui/uiStateHooks";

export function CategoryOther(): ReactElement {
    const open = UiStateHooks.useOpenPrimaryMenuDialog(<MenuOther/>);
    return (
        <div onClick={open}>
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