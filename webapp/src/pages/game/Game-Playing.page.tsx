import {Canvas} from "@modules/uicomponents/canvas/Canvas.tsx";
import {GameRenderer} from "@pages/game/renderer/game-renderer.ts";
import {useEffect} from "react";

const renderer = new GameRenderer()

export function GamePlayingPage() {

    useEffect(() => {
        renderer.listen()
    })

    return (
        <Canvas
            onInitialize={canvas => renderer.initialize(canvas)}
            onUpdate={() => renderer.update()}
            onResize={canvas => renderer.resize(canvas)}
            onDispose={() => renderer.dispose()}
            onMouseMove={(mx, my, _x, _y, buttons) => renderer.mouseMove(mx, my, buttons)}
        />
    );
}