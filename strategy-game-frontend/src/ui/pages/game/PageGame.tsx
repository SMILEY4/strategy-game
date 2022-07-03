import {ReactElement, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {Hooks} from "../../../core/hooks";
import {DialogStack} from "../../components/DialogStack";
import "./pageGame.css";
import {MainSidebar} from "./ui/sidebar/MainSidebar";

export function PageGame(): ReactElement {

    const currentState = Hooks.useCurrentGameState();
    const navigate = useNavigate();


    useEffect(() => {
        if (currentState === "idle") {
            navigate("/home");
        }
    });

    return (
        <div className="game">
            {(currentState === "loading") && (
                <div>Loading...</div>
            )}
            {(currentState === "active") && (
                <div className="game-container">
                    {/*<Canvas/>*/}
                    <div className="game-ui">
                        <MainSidebar/>
                    </div>
                    <DialogStack/>
                </div>

            )}
        </div>
    );
}