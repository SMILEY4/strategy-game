import {Game} from "../../models/misc/game";
import {App} from "../../appContext";
import {GotoHooks} from "../../ui/pages/goto";
import {GameSession} from "../../models/misc/gameSession";
import {UnauthorizedError} from "../../common/UnauthorizedError";
import {GameStateContainer} from "../../models/misc/gameStateContainer";
import {handleGameState} from "../game/turn/game.turn.handle-game-state";

export function useGameSessionConnect(): (gameId: Game.Id) => void {
    const handleUnauthorized = useHandleUnauthorized();
    return (gameId: Game.Id) => {
        return Promise.resolve()
            .then(() => App.gameStateWriter.setGameSessionState(GameSession.SessionState.Loading))
            .then(() => App.gameSessionClient.connect(gameId, {
                onGameState: (gameState: GameStateContainer) => handleGameState(gameState),
            }))
            .catch(e => {
                console.error(e);
                App.gameStateWriter.setGameSessionState(GameSession.SessionState.Error);
            })
            .catch(error => UnauthorizedError.handle(error, () => {
                handleUnauthorized();
            }));
    };
}

function useHandleUnauthorized() {
    const redirect = GotoHooks.useLoginRedirect("/login");
    return () => {
        redirect();
    };
}