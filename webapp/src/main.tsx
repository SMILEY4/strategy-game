import {createRoot} from "react-dom/client";
import {Canvas} from "@modules/uicomponents/canvas/Canvas.tsx";
import "./main.less";
import {GameRenderer} from "@renderer/game-renderer.ts";
import {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";

const renderer = new GameRenderer();

const _x = new RenderGraphBuilder();

createRoot(document.getElementById("root") || document.createElement("div")).render(
    <>
        <Canvas
            onInitialize={canvas => renderer.initialize(canvas)}
            onUpdate={() => renderer.update()}
            onResize={canvas => renderer.resize(canvas)}
            onDispose={() => renderer.dispose()}
            onMouseMove={(mx, my, _x, _y, buttons) => renderer.mouseMove(mx, my, buttons)}
        />
    </>,
);

renderer.listen();