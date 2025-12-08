import {useGameSessionCreate} from "../../../app/gamesession/gamesession.hook.create";
import {useState} from "react";

export function useCreateSession(reloadSessions: () => void) {
    const createGameSession = useGameSessionCreate()
    const [show, setShow] = useState(false);
    const [seed, setSeed] = useState("");
    const [name, setName] = useState("New Game");

    function getCleanSeed(seed: string) {
        let cleanSeed = seed.trim();
        if (cleanSeed.length === 0) {
            return null;
        } else {
            return cleanSeed;
        }
    }

    return {
        startCreateSession: () => {
            setSeed("");
            setShow(true);
        },
        cancelCreateSession: () => {
            setSeed("");
            setShow(false);
        },
        acceptCreateSession: () => {
            setSeed("");
            setShow(false);
            createGameSession(name, getCleanSeed(seed))
                .then(() => reloadSessions())
                .catch(console.error);
        },
        showCreateSession: show,
        seed: seed,
        setSeed: setSeed,
        name: name,
        setName: setName,
    };

}