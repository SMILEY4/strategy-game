import {ReactElement} from "react";
import {GrStatusUnknown} from "react-icons/gr";
import {useDialogManager} from "../../../../components/useDialogManager";

export function CategoryOther(): ReactElement {

    const open = useDialogManager().open;

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


export function MenuOther(props: {}): ReactElement {

    return (
        <div>
            <h3>Misc-Menu</h3>
        </div>
    );

}