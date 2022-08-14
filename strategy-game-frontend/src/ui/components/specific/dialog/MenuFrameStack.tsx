import {ReactElement} from "react";
import {UiFrames} from "../../../../external/state/ui/uiFrames";
import {UiStateHooks} from "../../../../external/state/ui/uiStateHooks";
import {Dialog} from "./Dialog";
import "./menuFrameStack.css";

export function MenuFrameStack(): ReactElement {

    const frames = UiStateHooks.useFrames();

    return (
        <div className="menu-frame-stack" id={UiFrames.FRAME_STACK_ID}>
            {frames.map(data => (
                <Dialog key={data.frameId} data={data}/>
            ))}
        </div>
    );

}