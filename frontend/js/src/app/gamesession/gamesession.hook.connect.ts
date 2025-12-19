import {Game} from "../../models/misc/game";
import {GotoHooks} from "../../ui/pages/goto";
import {GameSession} from "../../models/misc/gameSession";
import {UnauthorizedError} from "../../common/UnauthorizedError";
import {TurnService} from "../game/turn/turn.service";
import {GameSessionConnectionClient} from "./gamesession.client.connection";
import {GameStateMapper} from "./gamesession.gamestate-message-mapper";
import {Db} from "../database";

export function useGameSessionConnect(): (gameId: Game.Id) => void {
    const handleUnauthorized = useHandleUnauthorized();
    return (gameId: Game.Id) => {
        return Promise.resolve()
            .then(() => setGameSessionState(GameSession.SessionState.Loading))
            .then(() => GameSessionConnectionClient.open(gameId, message => {
                if (message.type === "game-state") {
                    console.debug("Received new game state", message.payload)
                    TurnService.handleNewGameState(GameStateMapper.map(message.payload));
                }
            }))
            .catch(e => {
                console.error(e);
                setGameSessionState(GameSession.SessionState.Error);
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

function setGameSessionState(state: GameSession.SessionState) {
    Db.gameSession.update(() => ({
        sessionState: state,
    }));
}