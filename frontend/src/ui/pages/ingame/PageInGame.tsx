import React, {ReactElement, useEffect} from "react";
import {useQuery} from "../../components/headless/useQuery";
import {Canvas} from "./canvas/Canvas";
import {MenuBar} from "./menubar/MenuBar";
import {WindowStack} from "../../components/windows/stack/WindowStack";
import {BackgroundPanel} from "../../components/panels/background/BackgroundPanel";
import {DecoratedPanel} from "../../components/panels/decorated/DecoratedPanel";
import {Text} from "../../components/text/Text";
import {useConnectGameSession, useGameState} from "../../hooks/gamesession/gameSessions";
import "./pageInGame.scoped.less";

const USE_DUMMY_CANVAS = true;

export function PageInGame(): ReactElement {
    const currentState = useGameState();
    const loadGame = useLoadGame();

    useEffect(() => {
        loadGame();
    }, []);

    if (currentState === "loading") {
        return <GameLoading/>;
    } else if (currentState === "playing") {
        return <GamePlaying/>;
    } else {
        return <GameError/>;
    }
}

function GameLoading(): ReactElement {
    return (
        <BackgroundPanel fillParent centerContent>
            <DecoratedPanel>
                <Text>Loading ...</Text>
            </DecoratedPanel>
        </BackgroundPanel>
    );
}

function GameError(): ReactElement {
    return (
        <BackgroundPanel fillParent centerContent>
            <DecoratedPanel>
                <Text>An unexpected error occurred.</Text>
            </DecoratedPanel>
        </BackgroundPanel>
    );
}

function GamePlaying(): ReactElement {
    return (
        <div className="page-ingame page-ingame--playing">
            {
                USE_DUMMY_CANVAS
                    ? <div className="dummy-canvas"/>
                    : <Canvas/>
            }
            <MenuBar/>
            <WindowStack/>
        </div>
    );
}


function useLoadGame() {
    const connect = useConnectGameSession();
    const queryParams = useQuery();
    return () => {
        const paramGameId = queryParams.get("id")!!;
        connect(paramGameId);
    };
}
