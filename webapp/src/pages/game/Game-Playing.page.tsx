import "./game-playing.less";
import {GameUi} from "@pages/game/gameui/GameUi.tsx";
import {useGamePlayingViewModel} from "@pages/game/game-playing.view-model.ts";
import {Canvas} from "@modules/uicomponents/canvas/Canvas.tsx";
import {WindowStack} from "@modules/uicomponents/window/WindowStack.tsx";
import {DevUI} from "@pages/game/dev/DevUI.tsx";

export function GamePlayingPage() {

    const viewModel = useGamePlayingViewModel();

    return (
        <div className="game">
            <DevUI/>

            <div className="game-stage">
                <Canvas
                    className="game-canvas"
                    onInitialize={viewModel.onInitialize}
                    onUpdate={viewModel.onUpdate}
                    onResize={viewModel.onResize}
                    onDispose={viewModel.onDispose}
                    onMouseMove={viewModel.onMouseMove}
                    onMouseClick={viewModel.onMouseClick}
                    onMouseScroll={viewModel.onMouseScroll}
                />

                <div className="game-overlay" id="game-overlay"/>

                <div className="game-interface">
                    <GameUi/>
                </div>

                <WindowStack className={"game-window-stack"}/>
            </div>

        </div>
    );
}
