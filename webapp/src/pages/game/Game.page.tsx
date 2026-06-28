import {useGameId, useGameViewModel} from "@pages/game/game.view-model.ts";
import {GamePlayingPage} from "@pages/game/Game-Playing.page.tsx";
import {GameLoadingPage} from "@pages/game/Game-Loading.page.tsx";
import {GameErrorPage} from "@pages/game/Game-Error.page.tsx";
import {assertExhaustive} from "@modules/utilities/assert-exhaustive.ts";

export function GamePage() {

    const gameId = useGameId()
    const viewModel = useGameViewModel(gameId);

    if (viewModel.state === "playing") return (
        <GamePlayingPage/>
    );
    if (viewModel.state === "loading") return (
        <GameLoadingPage/>
    );
    if (viewModel.state === "error") return (
        <GameErrorPage/>
    );
    assertExhaustive(viewModel.state);

}