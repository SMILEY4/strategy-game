import {ReactElement, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {LocalGameStateHooks} from "../../../external/state/localgame/localGameStateHooks";
import {GameState} from "../../../models/state/gameState";
import {DialogStack} from "../../components/specific/DialogStack";
import {Canvas} from "./canvas/Canvas";
import "./pageGame.css";
import {GameMenuBar} from "./ui/GameMenuBar";

export function PageGame(): ReactElement {

    const currentState = LocalGameStateHooks.useCurrentGameState();
    const navigate = useNavigate();


    useEffect(() => {
        if (currentState === GameState.OUT_OF_GAME) {
            navigate("/home");
        }
    });

    return (
        <div className="game">
            {(currentState === GameState.LOADING) && (
                <div>Loading...</div>
            )}
            {((currentState === GameState.PLAYING) || currentState === GameState.SUBMITTED) && (
                <div className="game-container">
                    <Canvas/>
                    <div className="game-ui">
                        <GameMenuBar/>
                    </div>
                    <DialogStack/>
                </div>

            )}
        </div>
    );
}