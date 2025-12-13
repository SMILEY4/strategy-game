import {GameSessionClient} from "./gamesession.client";
import {Game} from "../../models/misc/game";

export function useGameSessionDelete(): (gameId: Game.Id) => Promise<void> {
    return (gameId: Game.Id) => {
        return GameSessionClient
            .delete(gameId)
            .then(() => undefined);
    };
}