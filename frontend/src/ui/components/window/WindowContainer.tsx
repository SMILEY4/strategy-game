import {ReactElement} from "react";
import {useWindowData} from "./windowHooks";
import "./windowContainer.scoped.less"
import "./windowContainer.less"
import {joinClassNames} from "../utils";

export interface WindowContainerProps {
    windowId: string
}

export function WindowContainer(props: WindowContainerProps): ReactElement {
    const {
        elementProps,
        isBlocked,
        content,
    } = useWindowData(props.windowId);

    return (
        <div {...elementProps} className={joinClassNames([
            "window-container",
            isBlocked ? "non-interactable" : null
        ])}>
            {content}
        </div>
    )
}