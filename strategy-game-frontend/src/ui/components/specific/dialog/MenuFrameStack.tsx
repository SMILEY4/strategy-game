import {ReactElement} from "react";
import {useUiFrames} from "../../../../core/hooks/useUiFrames";
import {UiFrames} from "../../../../external/state/ui/uiFrames";
import {Dialog} from "./Dialog";
import "./menuFrameStack.css";

export function MenuFrameStack(): ReactElement {

    const frames = useUiFrames();

    return (
        <div className="menu-frame-stack" id={UiFrames.FRAME_STACK_ID}>
            {frames.map(data => (
                <Dialog key={data.frameId} data={data}/>
            ))}
        </div>
    );

}