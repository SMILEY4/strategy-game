import {ReactElement} from "react";
import {UiStateHooks} from "../../../../external/state/ui/uiStateHooks";
import {Dialog} from "./Dialog";
import "./menuFrameStack.css";

export function MenuFrameStack(): ReactElement {

    const frames = UiStateHooks.useFrames();

    return (
        <div className="menu-frame-stack">
            {frames.map(data => (
                <Dialog key={data.frameId} data={data}/>
            ))}
        </div>
    );

}