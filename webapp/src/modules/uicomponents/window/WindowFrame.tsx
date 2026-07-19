import {type ReactElement} from "react"
import {useWindowFrame} from "@modules/uicomponents/window/useWindowFrame.ts"
import classNames from "classnames"
import styles from "./windowFrame.module.less"

type WindowFrameProps = {
    className?: string;
    windowId: string
}

export function WindowFrame(props: WindowFrameProps): ReactElement {

    const {
        elementProps,
        isBlocked,
        content,
        bringToFront,
    } = useWindowFrame(props.windowId);

    return (
        <div
            {...elementProps}
            onMouseDown={bringToFront}
            className={classNames(styles["window-frame"], "window-frame", props.className)}
            data-blocked={isBlocked ? "" : undefined}
        >
            {content}
        </div>
    );
}