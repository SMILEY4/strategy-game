import "./canvas.less";
import "./resourceIcons.less";
import "./labels.less";
import "./paths.less";
import {useCanvasInteractions} from "./canvas.hooks.interactions";
import {useCanvasLifecycle} from "./canvas.hooks.lifecycle";

export function Canvas() {

    const interactions = useCanvasInteractions();
    const lifecycle = useCanvasLifecycle();

    return (
        <div
            className="game-canvas"
            onMouseMove={interactions.mouseMove}
            onMouseDown={interactions.mouseDown}
            onMouseUp={interactions.mouseUp}
            onWheel={interactions.scroll}
            onMouseLeave={interactions.mouseLeave}
        >
            <canvas ref={lifecycle.canvasRef}/>
            <div id="game-canvas-overlay"/>
        </div>
    );
}