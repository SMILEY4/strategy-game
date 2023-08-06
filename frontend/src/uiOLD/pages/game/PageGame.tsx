import {ReactElement, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useGameState} from "../../../core/hooks/useGameState";
import {GameState} from "../../../core/models/gameState";
import {MenuFrameStack} from "../../components/specific/dialog/MenuFrameStack";
import {Canvas} from "./canvas/Canvas";
import "./pageGame.css";
import {GameMenuBar} from "./ui/topbar/GameMenuBar";

export function PageGame(): ReactElement {

    const currentState = useGameState();
    const navigate = useNavigate();


    useEffect(() => {
        if (currentState === GameState.OUT_OF_GAME) {
            navigate("/home");
        }
    });

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
                    {/*<Canvas/>*/}
                    {/*<div className="game-ui">*/}
                    {/*    <GameMenuBar/>*/}
                    {/*</div>*/}
                    {/*<MenuFrameStack/>*/}
                </div>
            </div>
        );
    }

    if (currentState === GameState.LOADING) {
        return renderLoadingScreen();
    } else {
        return renderGameScreen();
    }
}