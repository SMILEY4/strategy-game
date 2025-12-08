import {GameSessionClient} from "./gamesession.client";
import {Game} from "../../models/misc/game";

export function useGameSessionDelete(): (gameId: Game.Id) => Promise<void> {

    function deleteGame(gameId: Game.Id): Promise<void> {
        return GameSessionClient
            .delete(gameId)
            .then(() => undefined);
    }

    return deleteGame;
}