import {ReactElement} from "react";
import {UiStore} from "../../external/state/ui/uiStore";
import {Dialog} from "./Dialog";
import "./dialogStack.css"

export function DialogStack(props: {}): ReactElement {

    const dialogs = UiStore.useState(state => state.dialogs);

    return (
        <div className="dialog-stack">
            {dialogs.map(data => (
                <Dialog data={data}/>
            ))}
        </div>
    );
}