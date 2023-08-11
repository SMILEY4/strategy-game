import {ReactElement} from "react";
import {joinClassNames} from "../utils";
import {useWindowData} from "../headless/useWindowData";
import "./window.css";

export interface WindowProps {
    windowId: string;
}

export function Window(props: WindowProps): ReactElement {

    const {
        elementProps,
        className,
        content
    } = useWindowData(props.windowId);

    return (
        <div {...elementProps} className={joinClassNames(["window", className])}>
            {content}
        </div>
    );
}