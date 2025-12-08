import {useGameSessionJoin} from "../../../app/gamesession/gamesession.hook.join";
import {useState} from "react";
import {Game} from "../../../models/misc/game";

export function useJoinSession(reloadSessions: () => void) {
    const joinGameSession = useGameSessionJoin()
    const [show, setShow] = useState(false);
    const [gameId, setGameId] = useState("");

    return {
        startJoinSession: () => {
            setGameId("");
            setShow(true);
        },
        cancelJoinSession: () => {
            setGameId("");
            setShow(false);
        },
        acceptJoinSession: () => {
            setGameId("");
            setShow(false);
            joinGameSession(gameId as Game.Id)
                .then(() => reloadSessions())
                .catch(console.error);
        },
        showJoinSession: show,
        sessionIdJoin: gameId,
        setSessionIdJoin: setGameId,
    };
}