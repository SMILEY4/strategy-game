import {useEffect, useRef} from "react";
import {createDebugPane} from "./debug-pane.ts";

export function DevUIPane() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        return createDebugPane(containerRef.current);
    }, []);

    return <div className="dev-ui-pane" ref={containerRef}/>;
}
