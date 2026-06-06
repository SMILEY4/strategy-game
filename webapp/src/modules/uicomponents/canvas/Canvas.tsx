import {useCanvasInteractions} from "./canvas.use-interactions.ts";
import {useCanvasLifecycle} from "@/modules/uicomponents/canvas/canvas.use-lifecycle.ts";
import type {ReactElement, ReactNode} from "react";
import classNames from "classnames";

interface CanvasProps {
    className?: string;
    children?: ReactNode;

    onInitialize?: (canvas: HTMLCanvasElement) => void,
    onUpdate?: () => void,
    onDispose?: () => void,
    onResize?: (canvas: HTMLCanvasElement) => void

    onMouseMove?: (mx: number, my: number, x: number, y: number, buttons: number) => void
    onMouseScroll?: (scroll: number, x: number, y: number) => void
    onMouseClick?: (x: number, y: number) => void
}

export function Canvas(props: CanvasProps): ReactElement {

    const interactions = useCanvasInteractions({...props});
    const lifecycle = useCanvasLifecycle({...props});

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