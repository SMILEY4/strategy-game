import {GamePlayingPage} from "@pages/game/Game-Playing.page.tsx";

export function GamePage() {

    return (
        <GamePlayingPage/>
    );

    // const gameId = useGameId()
    // const viewModel = useGameViewModel(gameId);
    //
    // if (viewModel.state === "playing") return (
    //     <GamePlayingPage/>
    // );
    // if (viewModel.state === "loading") return (
    //     <GameLoadingPage/>
    // );
    // if (viewModel.state === "error") return (
    //     <GameErrorPage/>
    // );
    // assertExhaustive(viewModel.state);

}