import {useEffect, useState} from "react";
import {Game} from "../../models/misc/game";
import {GameSessionClient} from "./gamesession.client";

export function useGameSessionsList(): [Game[], () => void] {
    const [games, setGames] = useState<Game[]>([]);

    useEffect(() => {
        load();
    });

    function load() {
        GameSessionClient
            .list()
            .then(games => setGames(games));
    }

    return [games, load];
}