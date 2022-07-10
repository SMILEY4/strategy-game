import {ReactElement} from "react";
import {GrStatusUnknown} from "react-icons/gr";
import {Hooks} from "../../../../core/hooks";

export function CategoryOther(): ReactElement {
    const open = Hooks.useOpenPrimaryMenuDialog(<MenuOther/>);
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