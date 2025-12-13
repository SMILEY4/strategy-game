import {GameSessionClient} from "./gamesession.client";
import {Game} from "../../models/misc/game";

export function useGameSessionJoin(): (gameId: Game.Id) => Promise<void> {
    return (gameId: Game.Id) => {
        return GameSessionClient
            .join(gameId)
            .then(() => undefined);
    };
}