import React, {ReactElement, useEffect, useState} from "react";
import {AppConfig} from "../../../../main";

export function JoinedGames(): ReactElement {

    const [games, setGames] = useState<string[]>([]);

    useEffect(() => {
        AppConfig.apiGame.list()
            .then(list => setGames(list));
    });

    return (
        <div>
            <b>Joined Worlds:</b>
            {games.map(g => (<div>{g}</div>))}
        </div>
    );

}