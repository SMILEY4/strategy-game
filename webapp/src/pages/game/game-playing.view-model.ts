import {DI} from "@app/app.ts";
import {GameRenderer} from "@pages/game/renderer/game-renderer.ts";

interface GamePlayingViewModel {
    onInitialize: (canvas: HTMLCanvasElement) => void;
    onUpdate: () => void,
    onResize: (canvas: HTMLCanvasElement) => void,
    onMouseMove: (mx: number, my: number, x: number, y: number, buttons: number) => void,
    onMouseClick: (x: number, y: number) => void,
    onMouseScroll: (delta: number, x: number, y: number) => void,
    onDispose: () => void
}

const renderer = new GameRenderer()

export function useGamePlayingViewModel(): GamePlayingViewModel {

    const onInitialize = (canvas: HTMLCanvasElement) => {
        renderer.initialize(canvas)
    };

    const onUpdate = () => {
        DI.gameEngine.onUpdate()
        renderer.update()
    };

    const onResize = (canvas: HTMLCanvasElement) => {
        DI.gameEngine.onResize(canvas.width, canvas.height);
        renderer.resize(canvas)
    };

    const onMouseMove = DI.gameEngine.onMouseMove;
    const onMouseClick = DI.gameEngine.onCanvasClick;
    const onMouseScroll = DI.gameEngine.onScroll;

    const onDispose = renderer.dispose


    return {
        onInitialize: onInitialize,
        onUpdate: onUpdate,
        onResize: onResize,
        onMouseMove: onMouseMove,
        onMouseClick: onMouseClick,
        onMouseScroll: onMouseScroll,
        onDispose: onDispose
    };
}