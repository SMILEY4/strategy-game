import "./game-playing.less";
import {GameUi} from "@pages/game/gameui/GameUi.tsx";
import {useGamePlayingViewModel} from "@pages/game/game-playing.view-model.ts";
import {Canvas} from "@modules/uicomponents/canvas/Canvas.tsx";
import {WindowStack} from "@modules/uicomponents/window/WindowStack.tsx";

export function GamePlayingPage() {

    const viewModel = useGamePlayingViewModel();

    return (
        <div className="game">

            <Canvas
                className="game-canvas"
                onInitialize={canvas => viewModel.onInitialize(canvas)}
                onUpdate={() => viewModel.onUpdate()}
                onResize={canvas => viewModel.onResize(canvas)}
                onDispose={() => viewModel.onDispose()}
                onMouseMove={(mx, my, x, y, buttons) => viewModel.onMouseMove(mx, my, x, y, buttons)}
                onMouseClick={(x, y) => viewModel.onMouseClick(x, y)}
                onMouseScroll={(delta, x, y) => viewModel.onMouseScroll(delta, x, y)}
            />

            <div className="game-overlay" id="game-overlay"/>

            <div className="game-interface">
                <GameUi/>
            </div>

            <WindowStack className={"game-window-stack"}/>

        </div>
    );
}