import {ReactElement} from "react";
import {useWindowStack} from "./windowHooks";
import {WindowContainer} from "./WindowContainer";
import "./windowStack.scoped.less"

export function WindowStack(): ReactElement {
    const windowIds = useWindowStack();
    return (
        <div className="window-stack">
            {windowIds.map(id => <WindowContainer key={id} windowId={id}/>)}
        </div>
    );
}