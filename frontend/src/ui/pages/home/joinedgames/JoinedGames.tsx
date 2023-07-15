import React, {ReactElement, useEffect, useState} from "react";
import {AppConfig} from "../../../../main";

export function JoinedGames(): ReactElement {
    const actionListGames = AppConfig.di.get(AppConfig.DIQ.GameListAction);
    const [games, setGames] = useState<string[]>([]);

    useEffect(() => {
        actionListGames.perform()
            .then((list: string[]) => setGames(list));
    }, []);

    return (
        <div>
            <b>Joined Games:</b>
            {games.map(g => (<div key={g}>{g}</div>))}
        </div>
    );

}