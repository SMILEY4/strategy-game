import "./game-playing.less";
import {TopMenu} from "@pages/game/gameui/TopMenu.tsx";

export function GamePlayingPage() {

    // const viewModel = useGamePlayingViewModel();

    return (
        <div className="game">

            {/*<Canvas*/}
            {/*    className="game-canvas"*/}
            {/*    onInitialize={canvas => viewModel.onInitialize(canvas)}*/}
            {/*    onUpdate={() => viewModel.onUpdate()}*/}
            {/*    onResize={canvas => viewModel.onResize(canvas)}*/}
            {/*    onDispose={() => viewModel.onDispose()}*/}
            {/*    onMouseMove={(mx, my, x, y, buttons) => viewModel.onMouseMove(mx, my, x, y, buttons)}*/}
            {/*    onMouseClick={(x, y) => viewModel.onMouseClick(x, y)}*/}
            {/*    onMouseScroll={(delta, x, y) => viewModel.onMouseScroll(delta, x, y)}*/}
            {/*/>*/}

            <div className="game-interface">

                <TopMenu/>

            </div>

        </div>
    );
}