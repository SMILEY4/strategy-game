import {useGameSessionStart} from "../../../app/gamesession/gamesession.hook.start";
import {Game} from "../../../models/misc/game";

export function useStartSession() {
    const startGameSession = useGameSessionStart();
    return (id: Game.Id) => {
        startGameSession(id);
    };
}
