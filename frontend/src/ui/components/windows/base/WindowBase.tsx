import {ReactElement} from "react";
import {joinClassNames} from "../../utils";
import {useWindowData} from "../../headless/useWindowData";
import "./windowBase.scoped.css";
import "./windowBase.css";

export interface WindowBaseProps {
    windowId: string;
}

export function WindowBase(props: WindowBaseProps): ReactElement {

    const {
        elementProps,
        className,
        content
    } = useWindowData(props.windowId);

    return (
        <div {...elementProps} className={joinClassNames(["window", className])} id={props.windowId}>
            {content}
        </div>
    );
}