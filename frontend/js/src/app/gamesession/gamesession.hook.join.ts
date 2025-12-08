import {GameSessionClient} from "./gamesession.client";
import {Game} from "../../models/misc/game";

export function useGameSessionJoin(): (gameId: Game.Id) => Promise<void> {

    function join(gameId: Game.Id): Promise<void> {
        return GameSessionClient
            .join(gameId)
            .then(() => undefined);
    }

    return join;
}