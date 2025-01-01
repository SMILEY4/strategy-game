import {ReactElement, useEffect} from "react";
import {useWindowIds} from "./windowHooks";
import {WindowContainer} from "./WindowContainer";
import "./windowStack.scoped.less"

export function WindowStack(): ReactElement {
    const windowIds = useWindowIds();
    return (
        <div className="window-stack" id="window-stack">
            {windowIds.map(id => <WindowContainer key={id} windowId={id}/>)}
        </div>
    );
}