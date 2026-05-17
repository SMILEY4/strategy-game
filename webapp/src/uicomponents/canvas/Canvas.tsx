import {useCanvasInteractions} from "./canvas.use-interactions";
import {useCanvasLifecycle} from "@uicomponents/canvas/canvas.use-lifecycle.ts";
import type {ReactElement, ReactNode} from "react";
import classNames from "classnames";

interface CanvasProps {
    className?: string;
    children?: ReactNode;
}

export function Canvas(props: CanvasProps): ReactElement {

    const interactions = useCanvasInteractions({});
    const lifecycle = useCanvasLifecycle({});

    return (
        <div
            className={classNames("canvas", props.className)}
            onMouseMove={interactions.mouseMove}
            onMouseDown={interactions.mouseDown}
            onMouseUp={interactions.mouseUp}
            onWheel={interactions.scroll}
            onMouseLeave={interactions.mouseLeave}
        >
            {/* eslint-disable-next-line react-hooks/refs */}
            <canvas ref={lifecycle.canvasRef}/>
            {props.children}
        </div>
    );
}