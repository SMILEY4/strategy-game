import React, {ReactElement, useEffect} from "react";
import "./pageInGame.css";
import {useQuery} from "../../components/misc/useQuery";
import {AppConfig} from "../../../main";
import {useGameState} from "../../../core/hooks/useGameState";
import {GameState} from "../../../core/models/gameState";
import {PanelCloth} from "../../components/panels/cloth/PanelCloth";
import {PanelDecorated} from "../../components/panels/decorated/PanelDecorated";

export function PageInGame(): ReactElement {
    const {currentState} = usePageInGame();
    if (currentState === GameState.LOADING) {
        return <GameLoading/>;
    } else if (currentState === GameState.PLAYING || currentState === GameState.SUBMITTED) {
        return <GamePlaying/>;
    } else {
        return <GameError/>;
    }
}

function GameLoading(): ReactElement {
    return (
        <PanelCloth className="page-ingame page-ingame--loading" color="blue">
            <PanelDecorated classNameContent="page-ingame--loading__content">
                <p>Loading...</p>
            </PanelDecorated>
        </PanelCloth>
    );
}

function GameError(): ReactElement {
    return (
        <PanelCloth className="page-ingame page-ingame--error" color="blue">
            <PanelDecorated classNameContent="page-ingame--error__content">
                <p>An unexpected error occurred.</p>
            </PanelDecorated>
        </PanelCloth>
    );
}

function GamePlaying(): ReactElement {
    return (
        <div className="page-ingame page-ingame--playing">
            In-Game
        </div>
    );
}

function usePageInGame() {
    const actionConnect = AppConfig.di.get(AppConfig.DIQ.GameConnectAction);
    const currentState = useGameState();
    const queryParams = useQuery();

    useEffect(() => {
        const paramGameId = queryParams.get("id")!!;
        actionConnect.perform(paramGameId);
    }, []);

    return {
        currentState: currentState,
    };
}