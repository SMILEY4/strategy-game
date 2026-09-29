import {useEffect, useRef} from "react";
import {createDebugPane} from "./debug-pane.ts";

interface DevUIPaneProps {
    onClose: () => void;
}

export function DevUIPane(props: DevUIPaneProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        return createDebugPane(containerRef.current, props.onClose);
    }, [props.onClose]);

    return <div className="dev-ui-pane" ref={containerRef}/>;
}
