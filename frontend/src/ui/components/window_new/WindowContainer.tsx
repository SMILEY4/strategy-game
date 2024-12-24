import {ReactElement} from "react";
import {useWindowData} from "./windowHooks";
import "./windowContainer.scoped.less"

export interface WindowContainerProps {
    windowId: string
}

export function WindowContainer(props: WindowContainerProps): ReactElement {
    const {
        elementProps,
        content
    } = useWindowData(props.windowId);

    return (
        <div {...elementProps} className="window-container">
            {content}
        </div>
    )
}