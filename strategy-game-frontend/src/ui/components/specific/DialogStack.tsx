import {ReactElement} from "react";
import {Hooks} from "../../../core/hooks";
import {Dialog} from "./Dialog";
import "./dialogStack.css";

export function DialogStack(): ReactElement {
    const dialogs = Hooks.useDialogs();
    return (
        <div className="dialog-stack">
            {dialogs.map(data => (
                <Dialog key={data.windowId} data={data}/>
            ))}
        </div>
    );
}