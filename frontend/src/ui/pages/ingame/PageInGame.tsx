import React, {ReactElement} from "react";
import {useQuery} from "../../components/misc/useQuery";
import {AppConfig} from "../../../main";
import {GameState} from "../../../core/models/gameState";
import {PanelCloth} from "../../components/objects/panels/cloth/PanelCloth";
import {PanelDecorated} from "../../components/objects/panels/decorated/PanelDecorated";
import {Canvas} from "./canvas/Canvas";
import "./pageInGame.css";
import {MenuBar} from "./menubar/MenuBar";
import {WindowStack} from "../../components/windows/stack/WindowStack";
import {GameStore} from "../../../external/state/game/gameStore";

const USE_DUMMY_CANVAS = true;

export function PageInGame(): ReactElement {
    // const currentState = useGameState();
    // const loadGame = useLoadGame();
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
        <PanelCloth className="page-ingame page-ingame--loading" color="blue">
            <PanelDecorated classNameContent="page-ingame--loading__content">
                <p>Loading...</p>
            </PanelDecorated>
        </PanelCloth>
    );
}

function GameError(props: { state: GameState }): ReactElement {
    return (
        <PanelCloth className="page-ingame page-ingame--error" color="blue">
            <PanelDecorated classNameContent="page-ingame--error__content">
                <p>An unexpected error occurred.</p>
                <p>{"(state=" + props.state + ")"}</p>
            </PanelDecorated>
        </PanelCloth>
    );
}

function GamePlaying(): ReactElement {
    return (
        <div className="page-ingame page-ingame--playing test">
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
    return GameStore.useState(state => state.currentState)
}
