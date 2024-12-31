import {ReactElement} from "react";
import {useBringWindowToFront, useWindowData} from "./windowHooks";
import "./windowContainer.scoped.less";
import "./windowContainer.less";
import {joinClassNames} from "./utils";

export interface WindowContainerProps {
    windowId: string;
}

export function WindowContainer(props: WindowContainerProps): ReactElement {

    const {
        elementProps,
        isBlocked,
        content,
    } = useWindowData(props.windowId);

    const bringToFront = useBringWindowToFront();

    return (
        <div
            {...elementProps}
            className={joinClassNames([
                "window-container",
                isBlocked ? "non-interactable" : null,
            ])}
            onMouseDown={() => bringToFront(props.windowId)}
        >
            {content}
        </div>
    );
}