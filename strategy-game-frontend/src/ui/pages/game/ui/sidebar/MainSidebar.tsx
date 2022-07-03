import {ReactElement} from "react";
import "./mainSidebar.css";
import {MainSidebarSectionContext} from "./MainSidebarSectionContext";
import {MainSidebarSectionTurn} from "./MainSidebarSectionTurn";

export function MainSidebar(): ReactElement {

    return (
        <div className="main-sidebar">
            <MainSidebarSectionContext/>
            <MainSidebarSectionTurn/>
        </div>
    );

}