import React, {ReactElement} from "react";
import {useQuery} from "../../components/headless/useQuery";
import {AppConfig} from "../../../main";
import {GameState} from "../../../core/models/gameState";
import {Canvas} from "./canvas/Canvas";
import {MenuBar} from "./menubar/MenuBar";
import {WindowStack} from "../../components/windows/stack/WindowStack";
import {GameStore} from "../../../external/state/game/gameStore";
import {BackgroundPanel} from "../../components/panels/background/BackgroundPanel";
import {DecoratedPanel} from "../../components/panels/decorated/DecoratedPanel";
import {Text} from "../../components/static/text/Text";
import "./pageInGame.scoped.less";

const USE_DUMMY_CANVAS = true;

export function PageInGame(): ReactElement {
    const currentState = useGameState();
    const loadGame = useLoadGame();
    //
    // useEffect(() => {
    //     loadGame()
    // }, [])
    //
    // if (currentState === GameState.LOADING) {
    //     return <GameLoading/>;
    // } else if (currentState === GameState.PLAYING || currentState === GameState.SUBMITTED) {
    return <GamePlaying/>;
    // } else {
    //     return <GameError state={currentState}/>;
    // }
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

function GameError(props: { state: GameState }): ReactElement {
    return (
        <BackgroundPanel fillParent centerContent>
            <DecoratedPanel>
                <Text>An unexpected error occurred.</Text>
                <Text>{"(" + props.state + ")"}</Text>
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
    const actionConnect = AppConfig.di.get(AppConfig.DIQ.GameConnectAction);
    const queryParams = useQuery();
    return () => {
        const paramGameId = queryParams.get("id")!!;
        actionConnect.perform(paramGameId);
    };
}

function useGameState() {
    return GameStore.useState(state => state.currentState);
}
