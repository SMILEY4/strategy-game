import React, {ReactElement, useEffect} from "react";
import {useQuery} from "../../components/headless/useQuery";
import {Canvas} from "./canvas/Canvas";
import {MenuBar} from "./menubar/MenuBar";
import {BackgroundPanel} from "../../components/panels/background/BackgroundPanel";
import {DecoratedPanel} from "../../components/panels/decorated/DecoratedPanel";
import "./pageInGame.scoped.less";
import {WindowStack} from "../../components/window/WindowStack";
import {HBox} from "../../components/layout/hbox/HBox";
import {Txt} from "../../components/text/Txt";
import {useGameSessionConnect} from "../../../app/gamesession/gamesession.hook.connect";
import {Game} from "../../../models/misc/game";
import {useGameSessionDisconnect} from "../../../app/gamesession/gamesession.hook.disconnect";
import {useGameSessionState} from "../../../app/gamesession/gamesession.hook.state";

const USE_DUMMY_CANVAS = false;

export function PageInGame(): ReactElement {

    const currentState = useGameSessionState();

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
        <BackgroundPanel>
            <DecoratedPanel ornament>
                <HBox padding_l>
                    <Txt.Body>
                        <Txt.String>Loading ...</Txt.String>
                    </Txt.Body>
                </HBox>
            </DecoratedPanel>
        </BackgroundPanel>
    );
}

function GameError(): ReactElement {
    return (
        <BackgroundPanel>
            <DecoratedPanel ornament>
                <HBox padding_l>
                    <Txt.Body>
                        <Txt.String>An unexpected error occurred.</Txt.String>
                    </Txt.Body>
                </HBox>
            </DecoratedPanel>
        </BackgroundPanel>
    );
}


function GamePlaying(): ReactElement {

    const disconnect = useGameSessionDisconnect();

    useEffect(() => {
        window.onbeforeunload = endGamePlaying;
        window.onunload = endGamePlaying;
        return () => {
            window.onbeforeunload = null;
            window.onunload = null;
            endGamePlaying();
        };
    }, []);

    function endGamePlaying() {
        disconnect();
    }

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
    const connect = useGameSessionConnect();
    const queryParams = useQuery();
    return () => {
        const paramGameId = queryParams.get("id")! as Game.Id;
        connect(paramGameId);
    };
}
