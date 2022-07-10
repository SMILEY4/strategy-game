import {ReactElement} from "react";
import "./gameMenuBar.css";
import {CategoryDebug} from "./MenuDebug";
import {CategoryOther} from "./MenuOther";
import {NextTurnAction} from "./NextTurnAction";

export function GameMenuBar(): ReactElement {
    return (
        <div className="game-menu-bar">
            <div className="category-area">
                <CategoryOther/>
                <CategoryDebug/>
            </div>
            <div className="info-section">
                <FoodResource/>
                <WoodResource/>
                <StoneResource/>
                <MetalResource/>
            </div>
            <div className="action-section">
                <NextTurnAction/>
            </div>
        </div>
    );
}


export function FoodResource(): ReactElement {
    return (<div>F: 298/400 (+4)</div>);
}

export function WoodResource(): ReactElement {
    return (<div>W: 4503/6000 (+24)</div>);
}

export function StoneResource(): ReactElement {
    return (<div>S: 280/300 (+3)</div>);
}

export function MetalResource(): ReactElement {
    return (<div>M: 59/100 (-2)</div>);
}


