import {ReactElement} from "react";
import {UiStateHooks} from "../../../../external/state/ui/uiStateHooks";
import {Dialog} from "./Dialog";
import "./dialogStack.css";

export function DialogStack(): ReactElement {

    const dialogs = UiStateHooks.useDialogs();

    return (
        <div className="dialog-stack">
            {dialogs.map(data => (
                <Dialog key={data.windowId} data={data}/>
            ))}
        </div>
    );

}