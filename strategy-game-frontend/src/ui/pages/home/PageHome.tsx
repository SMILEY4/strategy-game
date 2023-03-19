import React, {ReactElement} from "react";
import {AppConfig} from "../../../main";
import {CreateWorld} from "./createworld/CreateWorld";
import {JoinedGames} from "./joinedgames/JoinedGames";
import {JoinWorld} from "./joinworld/JoinWorld";
import "./pageHome.css";

export function PageHome(): ReactElement {

    return (
        <div className="home">
            <div className="home-content">
                <CreateWorld/>
                <JoinWorld/>
                <JoinedGames/>
                <div>
                    <button onClick={onLogOut}>Log Out</button>
                </div>
            </div>
        </div>
    );

    function onLogOut() {
        AppConfig.userLogOut.perform();
    }

}