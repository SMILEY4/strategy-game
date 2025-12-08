import {useGameSessionDelete} from "../../../app/gamesession/gamesession.hook.delete";
import {Game} from "../../../models/misc/game";

export function useDeleteSession(reloadSessions: () => void) {
    const deleteGameSession = useGameSessionDelete()
    return (id: Game.Id) => {
        deleteGameSession(id)
            .then(() => reloadSessions())
            .catch(console.error);
    };
}