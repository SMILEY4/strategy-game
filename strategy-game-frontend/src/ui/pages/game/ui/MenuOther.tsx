import {ReactElement} from "react";
import {GrStatusUnknown} from "react-icons/gr";
import {AppConfig} from "../../../../main";

export function CategoryOther(): ReactElement {
    const uiService = AppConfig.di.get(AppConfig.DIQ.UIService);
    return (
        <div onClick={() => uiService.openToolbarMenuOther()}>
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