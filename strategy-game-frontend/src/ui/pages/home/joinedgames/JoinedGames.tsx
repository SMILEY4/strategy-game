import React, {ReactElement, useEffect, useState} from "react";
import {AppConfig} from "../../../../main";

export function JoinedGames(): ReactElement {

    const [games, setGames] = useState<string[]>([]);

    useEffect(() => {
        AppConfig.apiGame.list()
            .then((list: string[]) => setGames(list));
    }, []);

    return (
        <div>
            <b>Joined Games:</b>
            {games.map(g => (<div>{g}</div>))}
        </div>
    );

}