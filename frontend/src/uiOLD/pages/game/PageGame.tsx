import React, {ReactElement, useEffect} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useGameState} from "../../../core/hooks/useGameState";
import {GameState} from "../../../core/models/gameState";
import {MenuFrameStack} from "../../components/specific/dialog/MenuFrameStack";
import {Canvas} from "./canvas/Canvas";
import "./pageGame.css";
import {GameMenuBar} from "./ui/topbar/GameMenuBar";
import {AppConfig} from "../../../main";
import {useQuery} from "../../../ui/components/misc/useQuery";

export function PageGame(): ReactElement {

    const actionConnect = AppConfig.di.get(AppConfig.DIQ.GameConnectAction);
    const currentState = useGameState();
    const queryParams = useQuery()

    useEffect(() => {
        const paramGameId = queryParams.get("id")!!
        actionConnect.perform(paramGameId).then(undefined)
    }, []);

    if (currentState === GameState.LOADING || currentState === GameState.OUT_OF_GAME) {
        return renderLoadingScreen();
    } else {
        return renderGameScreen();
    }

    function renderLoadingScreen(): ReactElement {
        return (
            <div className="game">
                <div>Loading...</div>
            </div>
        );
    }

    function renderGameScreen(): ReactElement {
        return (
            <div className="game">
                <div className="game-container">
                    <Canvas/>
                    <div className="game-ui">
                        <GameMenuBar/>
                    </div>
                    <MenuFrameStack/>
                </div>
            </div>
        );
    }

}