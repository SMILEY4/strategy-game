import {ReactElement} from "react";
import {joinClassNames} from "../../utils";
import {useWindowStack} from "../../headless/useWindowData";
import {WindowBase} from "../base/WindowBase";
import "./windowStack.scoped.less";

export interface WindowStackProps {
    className?: string;
}

export function WindowStack(props: WindowStackProps): ReactElement {

    const {
        windowIds,
        stackId,
    } = useWindowStack();

    return (
        <div className={joinClassNames(["window-stack", props.className])} id={stackId}>
            {windowIds.map(id => (
                <WindowBase key={id} windowId={id}/>
            ))}
        </div>
    );
}