import {Canvas} from "@modules/uicomponents/canvas/Canvas.tsx";
import {useGamePlayingViewModel} from "@pages/game/game-playing.view-model.ts";

export function GamePlayingPage() {

    const viewModel = useGamePlayingViewModel();

    return (
        <Canvas
            onInitialize={canvas => viewModel.onInitialize(canvas)}
            onUpdate={() => viewModel.onUpdate()}
            onResize={canvas => viewModel.onResize(canvas)}
            onDispose={() => viewModel.onDispose()}
            onMouseMove={(mx, my, _x, _y, buttons) => viewModel.onMouseMove(mx, my, buttons)}
        />
    );
}